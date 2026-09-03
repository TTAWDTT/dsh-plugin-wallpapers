/** Wallpaper preferences stored in the Host user-settings document. */
/** Settings namespace owned by the wallpaper plugin. */
export declare const WALLPAPER_SETTINGS_NAMESPACE = "ui-wallpaper";
/** Field carrying the selected wallpaper (`<collection>:<id>`, empty for none). */
export declare const WALLPAPER_SELECTION_FIELD = "selection";
/** Field carrying the background audio mute preference. */
export declare const WALLPAPER_MUTE_FIELD = "muted";
/** Mute default: video backgrounds stay silent until the user opts in. */
export declare const DEFAULT_WALLPAPER_MUTED = true;
/** Durable wallpaper section shared by the Host schema and the browser scope. */
export interface WallpaperSettings {
    /** Selected wallpaper id (`<collection>:<id>`), or the empty string for none. */
    selection: string;
    /** Whether the background layer's audio is muted. */
    muted: boolean;
}
/**
 * Split one stored selection value into its collection and id halves.
 * @param selection - the stored `<collection>:<id>` value.
 * @returns the pair, or undefined when the value is empty or malformed.
 */
export declare function parseSelection(selection: string): {
    collection: string;
    id: string;
} | undefined;
