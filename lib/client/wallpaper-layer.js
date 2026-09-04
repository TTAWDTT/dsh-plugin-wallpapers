/** How long a web wallpaper's iframe gets to fire its load event (ms). */
const WEB_LOAD_TIMEOUT_MS = 15_000;
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
export const TRANSLUCENT_TOKENS = {
    '--dsw-alias-bg-base': { light: 'transparent', dark: 'transparent' },
    // The sidebar sits on the wallpaper's busiest area, but its text must stay
    // readable over any frame the video throws at it — a mid veil, not clear
    // glass (clear made icons/labels hard to see on bright wallpapers).
    '--dsw-specific-sidebar-fill': { light: 'rgba(255, 255, 255, 0.55)', dark: 'rgba(30, 30, 34, 0.55)' },
    '--dsw-specific-input-major': { light: 'rgba(255, 255, 255, 0.55)', dark: 'rgba(30, 30, 34, 0.55)' },
    '--dsw-specific-bubble': { light: 'rgba(255, 255, 255, 0.6)', dark: 'rgba(30, 30, 34, 0.6)' },
    '--dsw-alias-bg-layer-2': { light: 'rgba(255, 255, 255, 0.82)', dark: 'rgba(30, 30, 34, 0.82)' },
    '--dsw-alias-bg-layer-3': { light: 'rgba(255, 255, 255, 0.92)', dark: 'rgba(30, 30, 34, 0.92)' },
    '--dsw-specific-menu': { light: 'rgba(255, 255, 255, 0.92)', dark: 'rgba(30, 30, 34, 0.92)' },
};
/**
 * Mount the background layer for one selected wallpaper.
 * @param summary - the selected wallpaper's roster row.
 * @param muted - whether the layer's audio starts muted.
 * @returns disposer removing the layer element.
 */
export function mountWallpaperLayer(summary, muted) {
    if (typeof document === 'undefined')
        return () => { };
    const layer = document.createElement('div');
    layer.dataset.dswWallpaperLayer = '';
    layer.setAttribute('aria-hidden', 'true');
    let media;
    if (summary.kind === 'video' && summary.entryUrl !== null) {
        const video = document.createElement('video');
        video.src = summary.entryUrl;
        video.muted = muted;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.disablePictureInPicture = true;
        media = video;
    }
    else if (summary.kind === 'web' && summary.entryUrl !== null) {
        const frame = document.createElement('iframe');
        frame.src = summary.entryUrl;
        // Workshop web wallpapers are arbitrary user HTML/JS served same-origin,
        // so the sandbox must stay an opaque origin: `allow-same-origin` joining
        // `allow-scripts` would hand the frame its full origin privileges back
        // (parent DOM, cookies, credentialed /api calls).
        frame.setAttribute('sandbox', 'allow-scripts');
        // The layer is pointer-transparent; the frame inside it must not become
        // an interaction sink the rest of the app cannot see.
        frame.style.pointerEvents = 'none';
        frame.setAttribute('title', '');
        frame.setAttribute('tabindex', '-1');
        media = frame;
        const timer = setTimeout(() => { frame.src = ''; }, WEB_LOAD_TIMEOUT_MS);
        frame.addEventListener('load', () => { clearTimeout(timer); }, { once: true });
    }
    if (media === undefined)
        return () => { };
    layer.appendChild(media);
    document.body.appendChild(layer);
    if (media instanceof HTMLVideoElement) {
        void media.play().catch(() => { });
    }
    return () => { layer.remove(); };
}
