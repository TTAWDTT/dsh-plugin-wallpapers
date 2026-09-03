/**
 * Public payload vocabulary of the Wallpaper Engine Remote: the roster a
 * trusted client renders, and the per-wallpaper fields it acts on.
 */
/** Which Wallpaper Engine surface a wallpaper came from. */
export type WallpaperCollection = 'workshop' | 'bundled';
/** Wallpaper kinds the project.json `type` field carries. */
export type WallpaperKind = 'scene' | 'video' | 'web' | 'unknown';
/** Property definition a wallpaper publishes in its project.json. */
export interface WallpaperProperty {
    /** Property key (`applyUserProperties` argument). */
    readonly key: string;
    /** Human-facing label from project.json; falls back to the key. */
    readonly text: string;
    /** Property type as Wallpaper Engine declares it. */
    readonly type: string;
    /** Default value in wire form (strings for color, numbers for slider). */
    readonly value: string | number | boolean;
    /** Ordered choices for combo properties. */
    readonly options?: readonly {
        label: string;
        value: string;
    }[];
}
/** One Wallpaper Engine wallpaper the roster reports. */
export interface WallpaperSummary {
    /** Stable identity: the workshop id, or the bundled directory name. */
    readonly id: string;
    /** Where the wallpaper came from. */
    readonly collection: WallpaperCollection;
    /** Display title from project.json; falls back to the id. */
    readonly title: string;
    /** Wallpaper kind from project.json (lowercased), `unknown` when absent. */
    readonly kind: WallpaperKind;
    /**
     * Whether dsh can present it: `video` streams as an HTML video and `web`
     * loads as an iframe; `scene` needs Wallpaper Engine's proprietary scene
     * format and is listed but marked unsupported.
     */
    readonly supported: boolean;
    /** URL path under the wallpapers webserver prefix serving the preview. */
    readonly previewUrl: string | null;
    /** URL path under the wallpapers webserver prefix serving the entry file. */
    readonly entryUrl: string | null;
    /** User-adjustable properties the wallpaper publishes. */
    readonly properties: readonly WallpaperProperty[];
    /** Content rating from project.json, when it declares one. */
    readonly contentRating: string | null;
}
/** Point-in-time roster returned by the wallpapers Remote. */
export interface WallpaperRoster {
    /** Every discovered wallpaper in scan order (bundled first, then workshop). */
    readonly wallpapers: readonly WallpaperSummary[];
    /** Whether any configured Steam library resolved on this host. */
    readonly steamRootsFound: boolean;
    /** Whether the Wallpaper Engine install path resolved on this host. */
    readonly installFound: boolean;
}
