/**
 * Wallpaper Engine discovery: Steam library roots from `libraryfolders.vdf`,
 * the Wallpaper Engine install under the library owning app 431960, workshop
 * content, bundled defaultprojects, and `project.json` parsing.
 *
 * Plain-text VDF parsing (no dependency): the file nests braces with
 * quoted key-value pairs, and every field discovery reads is a quoted scalar
 * whose value never contains a quote, so a tokenizer over quotes, braces, and
 * whitespace is exact for this input.
 * @module discovery
 */
import type { WallpaperCollection, WallpaperKind, WallpaperProperty } from './types.ts';
/** Wallpaper Engine's Steam app id. */
export declare const WALLPAPER_ENGINE_APP_ID = "431960";
/** One wallpaper entry a directory scan produced. */
export interface DiscoveredWallpaper {
    readonly collection: WallpaperCollection;
    readonly id: string;
    readonly projectPath: string;
}
/**
 * Parse every `path` value in `libraryfolders.vdf`, in file order.
 * @param vdf - file text.
 * @returns library root paths with escaped backslashes folded.
 */
export declare function parseLibraryRoots(vdf: string): string[];
/**
 * Read the Steam library roots that own Wallpaper Engine.
 * @param steamRoot - Steam root containing `steamapps`.
 * @param appId - Steam app id to look up (defaults to Wallpaper Engine's).
 * @returns library roots where the app is installed, in file order.
 */
export declare function discoverWallpaperEngineLibraries(steamRoot: string, appId?: string): Promise<string[]>;
/**
 * Classify one wallpaper's `project.json` `type` field.
 * @param raw - the field value, or undefined when absent.
 * @returns the lowercase kind, `unknown` for anything unlisted.
 */
export declare function wallpaperKind(raw: unknown): WallpaperKind;
/**
 * Extract the user-adjustable properties from one project.json.
 * @param general - the parsed `general` object, or undefined.
 * @returns properties in project.json order, `schemecolor` first like the
 * Wallpaper Engine UI does when an order field is absent.
 */
export declare function parseProperties(general: unknown): WallpaperProperty[];
/**
 * Parse one wallpaper directory's `project.json`.
 * @param projectPath - absolute path of the file.
 * @returns the parsed JSON object, or undefined when absent or unreadable.
 */
export declare function readProjectJson(projectPath: string): Promise<Record<string, unknown> | undefined>;
/**
 * Scan one collection directory for wallpaper directories.
 * @param root - absolute directory whose immediate children are wallpapers.
 * @param collection - which collection the scan serves.
 * @returns one entry per child carrying a `project.json`, sorted by id.
 */
export declare function scanCollection(root: string, collection: WallpaperCollection): Promise<DiscoveredWallpaper[]>;
/**
 * Parse one `reg query ... /v SteamPath` stdout.
 * @param stdout - the reg tool's output text.
 * @returns the Steam path with Steam's forward slashes folded to backslashes,
 * or undefined when no value line is present.
 */
export declare function parseRegSteamPath(stdout: string): string | undefined;
/**
 * Detect Steam's installation root without configuration: the Windows
 * registry (via `reg query`), then the standard install locations per
 * platform. Every known library — not just the root's own — is still found
 * afterwards through `libraryfolders.vdf`, so only the first root has to be
 * right.
 * @returns candidate Steam roots in probe order, deduplicated.
 */
export declare function detectSteamRoots(): Promise<string[]>;
