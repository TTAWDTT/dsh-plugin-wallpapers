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
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { WallpaperRoster } from './types.ts';
export type * from './types.ts';
export { WALLPAPER_ENGINE_APP_ID, discoverWallpaperEngineLibraries, wallpaperKind } from './discovery.ts';
/** Webserver pathname prefix this plugin's media routes live under. */
export declare const WALLPAPERS_ROUTE_PREFIX = "/wallpapers";
/**
 * The connection RPC channel carrying the roster. `/wallpapers` itself is the
 * media prefix, and a connection RPC channel registers as a prefix route, so
 * the channel must not reuse it.
 */
export declare const WALLPAPERS_RPC_CHANNEL = "/wallpapers-roster";
/** Plugin config: where Steam and Wallpaper Engine live on this host. */
export interface Config {
    /**
     * Steam installation roots holding `steamapps/libraryfolders.vdf`.
     * Empty (the default) enables detection: the Windows registry
     * `HKCU\Software\Valve\Steam\SteamPath`, then standard install locations.
     */
    steamLibraryRoots: string[];
    /** Wallpaper Engine Steam app id. @default '431960' */
    appId: string;
    /** Bundled-projects directory under the Wallpaper Engine install. @default 'projects/defaultprojects' */
    bundledProjectsSubPath: string;
}
export declare const Config: z<Config>;
declare module '@deepseek-ai/cordis' {
    interface Context {
        wallpapers: Wallpapers;
    }
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
export declare class Wallpapers extends Service {
    config: Config;
    static inject: string[];
    static Config: z<Config>;
    /** The Workshop content root, when the install resolved. */
    private workshopRoot;
    /** The bundled-projects root, when the install resolved. */
    private bundledRoot;
    /** Whether any configured Steam library carries the app id. */
    private steamRootsFound;
    constructor(ctx: Context, config: Config);
    /**
     * Claim the webserver prefix route for the lifetime of the plugin context.
     * The two collection roots are read per request through the install
     * resolution, so a first-ever Wallpaper Engine install is picked up
     * without a restart.
     */
    private registerRoutes;
    /**
     * Self-mount the roster RPC channel when the optional connection service is
     * composed (the web profile). Headless compositions load the plugin without
     * it; the inject list stays unconstrained so startup order does not matter.
     */
    private registerRosterChannel;
    /**
     * Dispatch one roster request.
     * @param endpoint - channel-relative endpoint.
     * @returns the endpoint-owned result; handlers never throw.
     */
    private dispatch;
    /**
     * Serve one media request against the current install roots.
     * @param decoded - decoded URL pathname under the prefix.
     * @param req - incoming request.
     * @param res - response to own.
     */
    private serve;
    /**
     * Re-resolve the Wallpaper Engine install from the configured Steam roots,
     * falling back to unconfigured detection (the Windows registry, then the
     * platform's standard install locations) when none are configured. The
     * install path is derived, not configured: `libraryfolders.vdf` already
     * locates the library owning the app id, and the install is that library's
     * `steamapps/common/wallpaper_engine`, so a second config field could only
     * disagree with it.
     */
    private resolveInstall;
    /**
     * Read every wallpaper once: bundled projects first (deployment-owned,
     * stable ids), then the Workshop (user-owned, numeric ids).
     */
    private scanAll;
    /**
     * Build one public summary from a project.json.
     * @param collection - which collection the wallpaper came from.
     * @param id - wallpaper id (directory name).
     * @param projectPath - absolute path of its project.json.
     */
    private summarize;
    /**
     * List the current roster.
     * @returns every discovered wallpaper plus what resolved on this host.
     */
    list(): Promise<WallpaperRoster>;
}
export default Wallpapers;
