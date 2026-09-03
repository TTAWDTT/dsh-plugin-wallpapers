/**
 * Host registration for the browser wallpaper preference: the durable
 * `ui-wallpaper` settings section carrying the selected wallpaper id and the
 * mute preference. The selection is a dsh-Web-UI background choice only —
 * nothing here reaches the Windows desktop wallpaper.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type WallpaperSettings } from '../wallpaper-settings.ts';
export { DEFAULT_WALLPAPER_MUTED, WALLPAPER_MUTE_FIELD, WALLPAPER_SELECTION_FIELD, WALLPAPER_SETTINGS_NAMESPACE, type WallpaperSettings, } from '../wallpaper-settings.ts';
/** Durable wallpaper section shared by the Host schema and the browser scope. */
export declare const WallpaperSettingsSchema: z<WallpaperSettings>;
/**
 * Register the durable wallpaper section when the optional settings service
 * is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export declare function applySettings(ctx: Context): void;
