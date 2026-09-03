/**
 * Browser wallpaper plugin: mounts the background layer for the selected
 * Wallpaper Engine wallpaper, registers the General-section preference row,
 * and opens the picker dialog. The selection and mute preference live in the
 * durable `ui-wallpaper` settings section; the roster comes over the
 * self-mounted `/wallpapers-roster` connection channel. dsh's own background
 * is what changes — the Windows desktop wallpaper is never touched.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type WallpaperKey } from './locales.ts';
export type { WallpaperDialogComponentProps, WallpaperDialogInjected } from './WallpaperDialog.tsx';
export type { WallpaperRowComponentProps, WallpaperRowInjected } from './WallpaperRow.tsx';
export type { RosterRead, WallpaperPickerState } from './picker-store.ts';
export type { WallpaperKey } from './locales.ts';
export type { WallpaperSettings } from '../wallpaper-settings.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The wallpaper row and dialog's copy. */
        'ui-wallpaper': WallpaperKey;
    }
}
/**
 * Required services: settings transport plus slots/locale for the preference
 * row; `theme` for the translucent override. `connection` carries the
 * `/wallpapers-roster` channel the roster read posts to (the host half
 * registers the channel without constraining startup order, and the read
 * degrades to the empty roster when the channel is absent). `remote` also
 * carries the forwarded settings invalidation that
 * `ctx.settingsScope.bind(spec)` subscribes to.
 */
export declare const inject: string[];
/**
 * Client plugin body: bind the settings scope, run the stage controller,
 * register the localized row and dialog.
 * @param ctx - client cordis context.
 */
export declare function apply(ctx: ClientContext): void;
