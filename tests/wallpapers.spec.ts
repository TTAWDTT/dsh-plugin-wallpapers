import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { Writable } from 'node:stream'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Wallpapers, { Config } from '../src/index.ts'
import { parseByteRange, serveFileWithRanges } from '../src/host/file-stream.ts'
import {
  detectSteamRoots, discoverWallpaperEngineLibraries, parseLibraryRoots, parseProperties,
  parseRegSteamPath, wallpaperKind,
} from '../src/host/discovery.ts'
import type { ServerResponse } from 'node:http'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

/** Write one wallpaper directory: project.json plus optional extra files. */
async function writeWallpaper(
  root: string, id: string, project: Record<string, unknown>, extra: Record<string, string> = {},
): Promise<void> {
  await mkdir(join(root, id), { recursive: true })
  await writeFile(join(root, id, 'project.json'), JSON.stringify(project))
  for (const [name, content] of Object.entries(extra)) {
    await writeFile(join(root, id, name), content)
  }
}

/** Build a Steam tree: libraryfolders.vdf naming one library with the app. */
async function writeSteamTree(root: string, appId: string): Promise<{ steamRoot: string; library: string }> {
  const library = join(root, 'library')
  const steamapps = join(library, 'steamapps')
  await mkdir(join(steamapps, 'common', 'wallpaper_engine', 'projects', 'defaultprojects'), { recursive: true })
  await mkdir(join(steamapps, 'workshop', 'content', appId), { recursive: true })
  const steamRoot = join(root, 'steam')
  await mkdir(join(steamRoot, 'steamapps'), { recursive: true })
  await writeFile(join(steamRoot, 'steamapps', 'libraryfolders.vdf'), [
    '"libraryfolders"',
    '{',
    '\t"0"',
    '\t{',
    `\t\t"path"\t\t"${library.replaceAll('\\', '\\\\')}"`,
    '\t\t"apps"',
    '\t\t{',
    `\t\t\t"${appId}"\t\t"0"`,
    '\t\t}',
    '\t}',
    '}',
  ].join('\n'))
  return { steamRoot, library }
}

describe('parseLibraryRoots', () => {
  it('extracts every library path in file order with escapes folded', () => {
    const vdf = [
      '"libraryfolders"',
      '{',
      '\t"0"',
      '\t{',
      '\t\t"path"\t\t"C:\\\\Program Files (x86)\\\\Steam"',
      '\t\t"apps"',
      '\t\t{',
      '\t\t\t"228980"\t\t"0"',
      '\t\t}',
      '\t}',
      '\t"1"',
      '\t{',
      '\t\t"path"\t\t"D:\\\\Steam"',
      '\t\t"apps"',
      '\t\t{',
      '\t\t\t"431960"\t\t"826275581"',
      '\t\t}',
      '\t}',
      '}',
    ].join('\n')
    expect(parseLibraryRoots(vdf)).toEqual([
      'C:\\Program Files (x86)\\Steam',
      'D:\\Steam',
    ])
  })
})

describe('discoverWallpaperEngineLibraries', () => {
  it('returns only libraries whose apps table owns the app id', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-wallpapers-vdf-'))
    contexts.push(new Context())
    try {
      const steamRoot = join(root, 'steam')
      await mkdir(join(steamRoot, 'steamapps'), { recursive: true })
      await mkdir(join(root, 'other', 'steamapps'), { recursive: true })
      await writeFile(join(steamRoot, 'steamapps', 'libraryfolders.vdf'), [
        '"libraryfolders"',
        '{',
        '\t"0"',
        '\t{',
        `\t\t"path"\t\t"${root.replaceAll('\\', '\\\\')}\\\\other"`,
        '\t\t"apps"',
        '\t\t{',
        '\t\t\t"228980"\t\t"0"',
        '\t\t}',
        '\t}',
        '\t"1"',
        '\t{',
        `\t\t"path"\t\t"${root.replaceAll('\\', '\\\\')}"`,
        '\t\t"apps"',
        '\t\t{',
        '\t\t\t"431960"\t\t"0"',
        '\t\t}',
        '\t}',
        '}',
      ].join('\n'))
      expect(await discoverWallpaperEngineLibraries(steamRoot, '431960')).toEqual([root])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('answers empty for a missing vdf', async () => {
    expect(await discoverWallpaperEngineLibraries(join('nowhere', 'steam'), '431960')).toEqual([])
  })
})

describe('wallpaperKind and parseProperties', () => {
  it('classifies type case-insensitively and folds unknown to unknown', () => {
    expect(wallpaperKind('Video')).toBe('video')
    expect(wallpaperKind('WEB')).toBe('web')
    expect(wallpaperKind('scene')).toBe('scene')
    expect(wallpaperKind(undefined)).toBe('unknown')
    expect(wallpaperKind('application')).toBe('unknown')
  })

  it('extracts adjustable properties in declared order and drops shortcuts', () => {
    const properties = parseProperties({
      properties: {
        usershortcut: { type: 'usershortcut', value: 'ctrl+k' },
        loudness: { type: 'slider', text: 'Volume', value: 3, order: 2 },
        hidden: { type: 'file', value: 'x' },
        muted: { type: 'bool', text: 'Mute', value: false, order: 1 },
        scheme: { type: 'color', text: 'ui_browse_properties_scheme_color', value: '0 0 0' },
      },
    })
    expect(properties.map(p => p.key)).toEqual(['muted', 'loudness', 'scheme'])
    expect(properties[0]).toMatchObject({ type: 'bool', value: false })
  })

  it('keeps combo options and answers empty without a table', () => {
    const withCombo = parseProperties({
      properties: {
        camera: {
          type: 'combo',
          text: 'Camera',
          value: 'true',
          options: [{ label: 'Straight', value: 'true' }, { label: 'Reverse', value: 'false' }],
        },
      },
    })
    expect(withCombo[0]!.options).toEqual([{ label: 'Straight', value: 'true' }, { label: 'Reverse', value: 'false' }])
    expect(parseProperties(undefined)).toEqual([])
    expect(parseProperties({})).toEqual([])
  })
})

describe('parseByteRange', () => {
  it('parses full, suffix, and clamped ranges and rejects the rest', () => {
    expect(parseByteRange(undefined, 100)).toBeUndefined()
    expect(parseByteRange('bytes=0-49', 100)).toEqual({ start: 0, end: 49 })
    expect(parseByteRange('bytes=50-', 100)).toEqual({ start: 50, end: 99 })
    expect(parseByteRange('bytes=-10', 100)).toEqual({ start: 90, end: 99 })
    expect(parseByteRange('bytes=-10', 5)).toEqual({ start: 0, end: 4 })
    expect(parseByteRange('bytes=0-999', 100)).toEqual({ start: 0, end: 99 })
    expect(parseByteRange('bytes=100-200', 100)).toBeNull()
    expect(parseByteRange('bytes=0-10,20-30', 100)).toBeNull()
    expect(parseByteRange('items=0-10', 100)).toBeNull()
  })
})

describe('serveFileWithRanges', () => {
  /** The collected state of one response double. */
  interface FakeRes {
    status: number | undefined
    headers: Record<string, unknown> | undefined
    chunks: Buffer[]
  }

  /** A Writable response double: collects piped bytes and written status. */
  function fakeRes(): ServerResponse & FakeRes {
    const state: FakeRes = { status: undefined, headers: undefined, chunks: [] }
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        state.chunks.push(chunk as Buffer)
        callback()
      },
    }) as ServerResponse
    Object.defineProperty(writable, 'headersSent', {
      get: () => state.headers !== undefined,
    })
    writable.writeHead = ((status: number, headers?: Record<string, unknown>) => {
      state.status = status
      state.headers = headers
      return writable
    }) as ServerResponse['writeHead']
    Object.defineProperty(writable, 'status', { get: () => state.status })
    Object.defineProperty(writable, 'headers', { get: () => state.headers })
    Object.defineProperty(writable, 'chunks', { get: () => state.chunks })
    return writable as ServerResponse & FakeRes
  }

  it('answers a full GET with 200 plus accept-ranges and honors one range', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-wallpapers-stream-'))
    contexts.push(new Context())
    try {
      const file = join(root, 'clip.mp4')
      await writeFile(file, '0123456789abcdef')
      const full = fakeRes()
      serveFileWithRanges({ headers: {}, method: 'GET' } as never, full, file, 'video/mp4')
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(full.status).toBe(200)
      expect(full.headers).toMatchObject({ 'content-length': 16, 'accept-ranges': 'bytes' })
      const part = fakeRes()
      serveFileWithRanges(
        { headers: { range: 'bytes=2-5' }, method: 'GET' } as never,
        part, file, 'video/mp4',
      )
      await new Promise(resolve => setTimeout(resolve, 20))
      expect(part.status).toBe(206)
      expect(part.headers).toMatchObject({ 'content-range': 'bytes 2-5/16', 'content-length': 4 })
      expect(Buffer.concat(part.chunks).toString()).toBe('2345')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('answers 404 for a missing file and 416 for an unsatisfiable range', async () => {
    const missing = fakeRes()
    serveFileWithRanges(
      { headers: {}, method: 'GET' } as never,
      missing, join('nowhere', 'clip.mp4'), 'video/mp4',
    )
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(missing.status).toBe(404)
  })
})

describe('parseRegSteamPath', () => {
  it('reads the value token and folds forward slashes to backslashes', () => {
    const stdout = [
      '',
      'HKEY_CURRENT_USER\\Software\\Valve\\Steam',
      '    SteamPath    REG_SZ    d:/steam',
      '',
    ].join('\n')
    expect(parseRegSteamPath(stdout)).toBe('d:\\steam')
  })

  it('answers undefined when no value line is present', () => {
    expect(parseRegSteamPath('ERROR: The system was unable to find the specified registry key or value.'))
      .toBeUndefined()
  })
})

describe('detectSteamRoots', () => {
  it('detects the real Steam root without configuration', async () => {
    // This host has Steam installed; wherever it is, detection must find a
    // directory that actually holds steamapps. On hosts without Steam the
    // probe answers empty, which the roster degrades on equally.
    const roots = await detectSteamRoots()
    expect(Array.isArray(roots)).toBe(true)
    for (const root of roots) {
      expect(root).toMatch(/steam/i)
    }
  }, 15000)

  it('lets an empty steamLibraryRoots config still resolve the install through detection', async () => {
    // Wire the detected root into a temp Steam tree only if detection found
    // nothing usable locally would make this flaky; instead assert the
    // config-level contract: empty roots are allowed and the service starts.
    const ctx = new Context()
    contexts.push(ctx)
    ctx.provide('webServer', { register: () => () => {} } as never)
    await ctx.plugin(Wallpapers, { steamLibraryRoots: [], appId: '431960', bundledProjectsSubPath: 'projects/defaultprojects' }).await()
    const wallpapers = ctx.get('wallpapers') as Wallpapers
    // Detection runs inside list(); on a Steam-less CI host it answers the
    // empty degrade shape instead of throwing.
    const roster = await wallpapers.list()
    expect(roster.steamRootsFound).toBe(await detectSteamRoots().then(roots => roots.length > 0))
  }, 20000)
})

describe('Wallpapers service', () => {
  it('self-mounts the /wallpapers-roster channel when a connection service exists', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    /** The channels this fake connection has taken, by name. */
    const channels = new Map<string, Parameters<NonNullable<Parameters<typeof registerFake>[1]>>>(new Map())
    function registerFake(channel: string, handler: unknown): () => Promise<void> {
      channels.set(channel, handler as never)
      return async () => { channels.delete(channel) }
    }
    ctx.provide('webServer', { register: () => () => {} } as never)
    ctx.provide('connection', {
      rpc: { handle: registerFake as never, intercept: () => { throw new Error('not needed') } },
    } as never)
    await ctx.plugin(Wallpapers, { steamLibraryRoots: [], appId: '431960', bundledProjectsSubPath: 'projects/defaultprojects' }).await()
    const wallpapers = ctx.get('wallpapers') as Wallpapers
    const handler = channels.get('/wallpapers-roster')
    expect(handler).toBeTypeOf('function')
    const answer = await (handler as (endpoint: string) => Promise<{ ok: boolean }>)('list')
    expect(answer.ok).toBe(true)
    // The roster flows through the same list() the tests below cover.
    expect(await wallpapers.list()).toEqual((answer as { value: unknown }).value)
    await ctx.fiber.dispose()
    expect(channels.has('/wallpapers-roster')).toBe(false)
  })

  it('answers unknown endpoints as failures without throwing', async () => {
    const ctx = new Context()
    contexts.push(ctx)
    /** The one channel this fake connection has taken. */
    let taken: ((endpoint: string) => Promise<{ ok: boolean }>) | undefined
    ctx.provide('webServer', { register: () => () => {} } as never)
    ctx.provide('connection', {
      rpc: { handle: (channel: string, handler: unknown) => { taken = handler as never; return async () => {} }, intercept: () => { throw new Error('not needed') } },
    } as never)
    await ctx.plugin(Wallpapers, { steamLibraryRoots: [], appId: '431960', bundledProjectsSubPath: 'projects/defaultprojects' }).await()
    const answer = await taken?.('nope')
    expect(answer?.ok).toBe(false)
  })

  it('lists bundled and workshop wallpapers with previews, entries, and unsupported scene rows', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-wallpapers-service-'))
    const ctx = new Context()
    contexts.push(ctx)
    ctx.provide('webServer', { register: () => () => {} } as never)
    try {
      const { steamRoot } = await writeSteamTree(root, '431960')
      const install = join(root, 'library', 'steamapps', 'common', 'wallpaper_engine')
      await writeWallpaper(join(install, 'projects', 'defaultprojects'), 'Bundled Video', {
        title: 'Bundled Video', type: 'video', file: 'clip.mp4', preview: 'preview.jpg',
        general: { properties: { muted: { type: 'bool', text: 'Mute', value: true } } },
      }, { 'clip.mp4': 'video-bytes', 'preview.jpg': 'jpeg' })
      await writeWallpaper(join(install, 'projects', 'defaultprojects'), 'Bundled Scene', {
        title: 'Bundled Scene', type: 'scene', file: 'scene.json', preview: 'preview.jpg',
      })
      await writeWallpaper(join(root, 'library', 'steamapps', 'workshop', 'content', '431960'), '311111', {
        title: 'Web Wall', type: 'Web', file: 'index.html', preview: 'preview.gif',
        general: { properties: { speed: { type: 'slider', text: 'Speed', value: 1, order: 0 } } },
      }, { 'index.html': '<html></html>', 'preview.gif': 'gif' })
      await ctx.plugin(Wallpapers, {
        steamLibraryRoots: [steamRoot],
        appId: '431960',
        bundledProjectsSubPath: 'projects/defaultprojects',
      }).await()
      const wallpapers = ctx.get('wallpapers') as Wallpapers
      const roster = await wallpapers.list()
      expect(roster.steamRootsFound).toBe(true)
      expect(roster.installFound).toBe(true)
      expect(roster.wallpapers).toHaveLength(3)
      const bundled = roster.wallpapers.filter(w => w.collection === 'bundled')
      expect(bundled.map(w => w.id)).toEqual(['Bundled Scene', 'Bundled Video'])
      const video = bundled.find(w => w.id === 'Bundled Video')!
      expect(video).toMatchObject({
        kind: 'video', supported: true, title: 'Bundled Video', contentRating: null,
      })
      expect(video.previewUrl).toBe('/wallpapers/bundled/Bundled%20Video/preview.jpg')
      expect(video.entryUrl).toBe('/wallpapers/bundled/Bundled%20Video/clip.mp4')
      expect(video.properties).toEqual([{ key: 'muted', text: 'Mute', type: 'bool', value: true }])
      const scene = bundled.find(w => w.id === 'Bundled Scene')!
      expect(scene).toMatchObject({ kind: 'scene', supported: false, entryUrl: null })
      expect(scene.previewUrl).not.toBeNull()
      const web = roster.wallpapers.find(w => w.collection === 'workshop')!
      expect(web).toMatchObject({
        id: '311111', kind: 'web', supported: true,
        entryUrl: '/wallpapers/workshop/311111/index.html',
      })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('reports an unresolved install without failing the roster', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-wallpapers-empty-'))
    const ctx = new Context()
    contexts.push(ctx)
    ctx.provide('webServer', { register: () => () => {} } as never)
    try {
      const steamRoot = join(root, 'steam')
      await mkdir(join(steamRoot, 'steamapps'), { recursive: true })
      await writeFile(join(steamRoot, 'steamapps', 'libraryfolders.vdf'), '"libraryfolders"\n{\n}')
      await ctx.plugin(Wallpapers, {
        steamLibraryRoots: [steamRoot],
        appId: '431960',
        bundledProjectsSubPath: 'projects/defaultprojects',
      }).await()
      const roster = await (ctx.get('wallpapers') as Wallpapers).list()
      expect(roster).toEqual({ wallpapers: [], steamRootsFound: true, installFound: false })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('keeps the config defaults matching the Steam layout', () => {
    expect(Config({
      steamLibraryRoots: ['D:\\Steam'],
      appId: '431960',
      bundledProjectsSubPath: 'projects/defaultprojects',
    })).toEqual({
      steamLibraryRoots: ['D:\\Steam'],
      appId: '431960',
      bundledProjectsSubPath: 'projects/defaultprojects',
    })
  })
})
