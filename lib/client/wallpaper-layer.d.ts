/**
 * The WallpaperLayer: dsh's own background stage. One fixed, pointer-transparent
 * element behind everything on `document.body` that plays the selected
 * Wallpaper Engine video (`<video>`) or web (`<iframe>`) wallpaper. The layer
 * exists only while a supported wallpaper is selected; removing the selection
 * removes the element, and the theme override that lets the wallpaper show
 * through is retracted with it. The Windows desktop is never touched — this
 * stage lives entirely inside the dsh Web UI.
 */
import type { WallpaperSummary } from '../host/types.ts';
/**
 * Apply the translucent-theme override: the app's base background and the
 * sidebar fill give way to the wallpaper while it plays, and retract when it
 * stops. Both modes get the same value — the wallpaper shows through either
 * scheme.
 *
 * Surfaces that would otherwise block or clash with the wallpaper become
 * translucent glass sheets tinted from the scheme's own ink (light: white
 * veils, dark: dark veils) rather than solid fills:
 * - the sidebar column (`sidebar-fill`) and the chat composer card
 *   (`input-major`) — the biggest blockers over the wallpaper,
 * - the user message bubble (`bubble`),
 * - settings panel and Modal cards (`bg-layer-2`) and dropdown menus
 *   (`bg-layer-3` / `menu`), which keep their hairline strokes and shadows
 *   for separation.
 * Rebinds derived aliases (`menu` reads layer-3) to the same glass so the
 * rebind doesn't resurrect an opaque fill underneath.
 */
export declare const TRANSLUCENT_TOKENS: {
    readonly '--dsw-alias-bg-base': {
        readonly light: "transparent";
        readonly dark: "transparent";
    };
    readonly '--dsw-specific-sidebar-fill': {
        readonly light: "rgba(255, 255, 255, 0.55)";
        readonly dark: "rgba(30, 30, 34, 0.55)";
    };
    readonly '--dsw-specific-input-major': {
        readonly light: "rgba(255, 255, 255, 0.55)";
        readonly dark: "rgba(30, 30, 34, 0.55)";
    };
    readonly '--dsw-specific-bubble': {
        readonly light: "rgba(255, 255, 255, 0.6)";
        readonly dark: "rgba(30, 30, 34, 0.6)";
    };
    readonly '--dsw-alias-bg-layer-2': {
        readonly light: "rgba(255, 255, 255, 0.82)";
        readonly dark: "rgba(30, 30, 34, 0.82)";
    };
    readonly '--dsw-alias-bg-layer-3': {
        readonly light: "rgba(255, 255, 255, 0.92)";
        readonly dark: "rgba(30, 30, 34, 0.92)";
    };
    readonly '--dsw-specific-menu': {
        readonly light: "rgba(255, 255, 255, 0.92)";
        readonly dark: "rgba(30, 30, 34, 0.92)";
    };
};
/**
 * Mount the background layer for one selected wallpaper.
 * @param summary - the selected wallpaper's roster row.
 * @param muted - whether the layer's audio starts muted.
 * @returns disposer removing the layer element.
 */
export declare function mountWallpaperLayer(summary: WallpaperSummary, muted: boolean): () => void;
