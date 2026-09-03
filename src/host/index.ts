/**
 * @deepseek-ai/dsh-host-wallpapers — Wallpaper Engine discovery and media
 * serving for the dsh Web UI: lists the wallpapers installed under the
 * Steam Workshop and the Wallpaper Engine install's bundled projects, and
 * serves their preview and entry files under a webserver prefix with
 * single-range support so <video> can stream. Scene wallpapers are listed
 * but marked unsupported (the scene.pkg format is proprietary); dsh's own
 * background is what changes — the Windows desktop is never touched.
 *
 * The roster answers over a self-mounted `/wallpapers-roster` connection RPC
 * channel (the subscriptions pattern): no Typert Remote, no core mounting —
 * the browser half calls the channel directly.
 * @module dsh-plugin-wallpapers/host
 */

import { access } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Context, Service } from '@deepseek-ai/cordis'
import type { ConnectionRpcHandler, ConnectionRpcResult, HostConnectionHandle } from '@deepseek-ai/dsh-client-connection'
import type {} from '@deepseek-ai/dsh-host-webserver'
import z from '@deepseek-ai/schemastery'
import {
  detectSteamRoots, discoverWallpaperEngineLibraries, parseProperties, readProjectJson,
  scanCollection, wallpaperKind, WALLPAPER_ENGINE_APP_ID,
} from './discovery.ts'
import { serveFileWithRanges } from './file-stream.ts'
import type { WallpaperProperty, WallpaperRoster, WallpaperSummary } from './types.ts'

export type * from './types.ts'
export { WALLPAPER_ENGINE_APP_ID, discoverWallpaperEngineLibraries, wallpaperKind } from './discovery.ts'

/** Webserver pathname prefix this plugin's media routes live under. */
export const WALLPAPERS_ROUTE_PREFIX = '/wallpapers'

/**
 * The connection RPC channel carrying the roster. `/wallpapers` itself is the
 * media prefix, and a connection RPC channel registers as a prefix route, so
 * the channel must not reuse it.
 */
export const WALLPAPERS_RPC_CHANNEL = '/wallpapers-roster'

/** MIME types the media routes need (wallpaper media reaches no other table). */
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

/** Plugin config: where Steam and Wallpaper Engine live on this host. */
export interface Config {
  /**
   * Steam installation roots holding `steamapps/libraryfolders.vdf`.
   * Empty (the default) enables detection: the Windows registry
   * `HKCU\Software\Valve\Steam\SteamPath`, then standard install locations.
   */
  steamLibraryRoots: string[]
  /** Wallpaper Engine Steam app id. @default '431960' */
  appId: string
  /** Bundled-projects directory under the Wallpaper Engine install. @default 'projects/defaultprojects' */
  bundledProjectsSubPath: string
}

export const Config: z<Config> = z.object({
  steamLibraryRoots: z.array(z.string()).default([]),
  appId: z.string().default(WALLPAPER_ENGINE_APP_ID),
  bundledProjectsSubPath: z.string().default('projects/defaultprojects'),
})

declare module '@deepseek-ai/cordis' {
  interface Context {
    wallpapers: Wallpapers
  }
}

/** One wallpaper resolved for serving: its summary plus its collection root. */
interface ResolvedWallpaper {
  readonly summary: WallpaperSummary
  readonly root: string
}

/**
 * Wallpaper Engine roster and media routes over a self-mounted RPC channel.
 *
 * The roster is re-read on every `list()` call: Workshop items arrive and
 * disappear outside this process, and a cache would pin the picker to a
 * snapshot Wallpaper Engine no longer agrees with. Serving resolves the
 * requested id against the same fresh read, so a URL for a deleted item
 * answers 404 instead of a stale file.
 */
export class Wallpapers extends Service {
  static inject = ['webServer']

  static Config = Config

  /** The Workshop content root, when the install resolved. */
  private workshopRoot: string | undefined
  /** The bundled-projects root, when the install resolved. */
  private bundledRoot: string | undefined
  /** Whether any configured Steam library carries the app id. */
  private steamRootsFound = false

  constructor(ctx: Context, public config: Config) {
    super(ctx, 'wallpapers')
    this.registerRoutes()
    this.registerRosterChannel()
  }

  /**
   * Claim the webserver prefix route for the lifetime of the plugin context.
   * The two collection roots are read per request through the install
   * resolution, so a first-ever Wallpaper Engine install is picked up
   * without a restart.
   */
  private registerRoutes(): void {
    this.ctx.effect(() => this.ctx.webServer.register({
      kind: 'prefix',
      path: WALLPAPERS_ROUTE_PREFIX,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        /* v8 ignore next -- node:http always sets url on server requests */
        const rawPath = new URL(req.url ?? '/', 'http://x').pathname
        let decoded: string
        try {
          decoded = decodeURIComponent(rawPath)
        } catch {
          res.writeHead(400)
          res.end()
          return
        }
        this.serve(decoded, req, res)
      },
    }), 'wallpapers: media routes')
  }

  /**
   * Self-mount the roster RPC channel when the optional connection service is
   * composed (the web profile). Headless compositions load the plugin without
   * it; the inject list stays unconstrained so startup order does not matter.
   */
  private registerRosterChannel(): void {
    this.ctx.inject(['connection'], (connCtx) => {
      const connection = connCtx.get('connection') as HostConnectionHandle
      connCtx.effect(
        () => connection.rpc.handle(
          WALLPAPERS_RPC_CHANNEL,
          async (endpoint, _payload, _signal): Promise<ConnectionRpcResult<unknown>> => {
            try {
              return await this.dispatch(endpoint)
            } catch (error) {
              return {
                ok: false,
                error: {
                  code: 'wallpapers/internal',
                  message: error instanceof Error ? error.message : String(error),
                  details: {},
                },
              }
            }
          },
        ),
        'wallpapers: /wallpapers-roster rpc channel',
      )
    })
  }

  /**
   * Dispatch one roster request.
   * @param endpoint - channel-relative endpoint.
   * @returns the endpoint-owned result; handlers never throw.
   */
  private async dispatch(endpoint: string): Promise<ConnectionRpcResult<unknown>> {
    switch (endpoint) {
      case 'list':
        return { ok: true, value: await this.list() }
      default:
        return {
          ok: false,
          error: {
            code: 'wallpapers/unknown-endpoint',
            message: `unknown ${WALLPAPERS_RPC_CHANNEL} endpoint "${endpoint}"`,
            details: {},
          },
        }
    }
  }

  /**
   * Serve one media request against the current install roots.
   * @param decoded - decoded URL pathname under the prefix.
   * @param req - incoming request.
   * @param res - response to own.
   */
  private serve(decoded: string, req: IncomingMessage, res: ServerResponse): void {
    const segments = decoded.split('/').filter(segment => segment.length > 0)
    // [wallpapers, <collection>, <id>, ...rest]; the length guard above
    // bounds the indexes, so the segment reads destructure safely.
    const [, collection = '', id = ''] = segments
    if (collection === '' || id === '') {
      res.writeHead(404)
      res.end()
      return
    }
    const root = collection === 'workshop'
      ? this.workshopRoot
      : collection === 'bundled'
        ? this.bundledRoot
        : undefined
    if (root === undefined) {
      res.writeHead(404)
      res.end()
      return
    }
    const base = resolve(root, id)
    // Traversal rejection over the decoded path: a `%2e%2e` leaves the URL
    // parser before this point, so the check runs on the decoded form, with
    // `sep` for Windows backslash targets (the frontend-static precedent).
    const target = resolve(base, ...segments.slice(3))
    if (!target.startsWith(base + sep)) {
      res.writeHead(403)
      res.end()
      return
    }
    serveFileWithRanges(req, res, target, MIME[extname(target).toLowerCase()] ?? 'application/octet-stream')
  }

  /**
   * Re-resolve the Wallpaper Engine install from the configured Steam roots,
   * falling back to unconfigured detection (the Windows registry, then the
   * platform's standard install locations) when none are configured. The
   * install path is derived, not configured: `libraryfolders.vdf` already
   * locates the library owning the app id, and the install is that library's
   * `steamapps/common/wallpaper_engine`, so a second config field could only
   * disagree with it.
   */
  private async resolveInstall(): Promise<void> {
    const configuredRoots = this.config.steamLibraryRoots
    const roots = configuredRoots.length > 0 ? configuredRoots : await detectSteamRoots()
    for (const steamRoot of roots) {
      this.steamRootsFound = true
      const libraries = await discoverWallpaperEngineLibraries(steamRoot, this.config.appId)
      for (const library of libraries) {
        const install = join(library, 'steamapps', 'common', 'wallpaper_engine')
        const workshopRoot = join(install, '..', '..', '..', 'steamapps', 'workshop', 'content', this.config.appId)
        const bundledRoot = join(install, ...this.config.bundledProjectsSubPath.split(/[\\/]+/))
        try {
          await access(bundledRoot)
        } catch {
          continue
        }
        this.workshopRoot = resolve(workshopRoot)
        this.bundledRoot = bundledRoot
        return
      }
    }
  }

  /**
   * Read every wallpaper once: bundled projects first (deployment-owned,
   * stable ids), then the Workshop (user-owned, numeric ids).
   */
  private async scanAll(): Promise<ResolvedWallpaper[]> {
    await this.resolveInstall()
    const resolved: ResolvedWallpaper[] = []
    if (this.bundledRoot !== undefined) {
      for (const entry of await scanCollection(this.bundledRoot, 'bundled')) {
        resolved.push({ summary: await this.summarize(entry.collection, entry.id, entry.projectPath), root: this.bundledRoot })
      }
    }
    if (this.workshopRoot !== undefined) {
      for (const entry of await scanCollection(this.workshopRoot, 'workshop')) {
        resolved.push({ summary: await this.summarize(entry.collection, entry.id, entry.projectPath), root: this.workshopRoot })
      }
    }
    return resolved
  }

  /**
   * Build one public summary from a project.json.
   * @param collection - which collection the wallpaper came from.
   * @param id - wallpaper id (directory name).
   * @param projectPath - absolute path of its project.json.
   */
  private async summarize(
    collection: 'workshop' | 'bundled', id: string, projectPath: string,
  ): Promise<WallpaperSummary> {
    const project = await readProjectJson(projectPath)
    const kind = wallpaperKind(project?.type)
    const title = typeof project?.title === 'string' && project.title.length > 0 ? project.title : id
    const file = typeof project?.file === 'string' ? project.file : null
    const preview = typeof project?.preview === 'string' ? project.preview : null
    const supported = kind === 'video' || kind === 'web'
    const properties: WallpaperProperty[] = parseProperties(project?.general)
    return {
      id,
      collection,
      title,
      kind,
      supported,
      previewUrl: preview === null
        ? null
        : `${WALLPAPERS_ROUTE_PREFIX}/${collection}/${encodeURIComponent(id)}/${encodeSegments(preview)}`,
      entryUrl: file === null || !supported
        ? null
        : `${WALLPAPERS_ROUTE_PREFIX}/${collection}/${encodeURIComponent(id)}/${encodeSegments(file)}`,
      properties,
      contentRating: typeof project?.contentrating === 'string' ? project.contentrating : null,
    }
  }

  /**
   * List the current roster.
   * @returns every discovered wallpaper plus what resolved on this host.
   */
  async list(): Promise<WallpaperRoster> {
    const resolved = await this.scanAll()
    return {
      wallpapers: resolved.map(entry => entry.summary),
      steamRootsFound: this.steamRootsFound,
      installFound: this.bundledRoot !== undefined,
    }
  }
}

/**
 * Encode one on-disk relative path's segments for a URL.
 * @param relativePath - path as project.json wrote it (either slash style).
 * @returns slash-joined percent-encoded segments.
 */
function encodeSegments(relativePath: string): string {
  return relativePath
    .split(/[\\/]+/)
    .filter(segment => segment.length > 0)
    .map(segment => encodeURIComponent(segment))
    .join('/')
}

export default Wallpapers
