/**
 * Host registration for the browser wallpaper preference: the durable
 * `ui-wallpaper` settings section carrying the selected wallpaper id and the
 * mute preference. The selection is a dsh-Web-UI background choice only —
 * nothing here reaches the Windows desktop wallpaper.
 */
import z from '@deepseek-ai/schemastery';
import { WALLPAPER_MUTE_FIELD, WALLPAPER_SELECTION_FIELD, WALLPAPER_SETTINGS_NAMESPACE, } from "../wallpaper-settings.js";
export { DEFAULT_WALLPAPER_MUTED, WALLPAPER_MUTE_FIELD, WALLPAPER_SELECTION_FIELD, WALLPAPER_SETTINGS_NAMESPACE, } from "../wallpaper-settings.js";
/** Durable wallpaper section shared by the Host schema and the browser scope. */
export const WallpaperSettingsSchema = z.object({
    [WALLPAPER_SELECTION_FIELD]: z.string().default(''),
    [WALLPAPER_MUTE_FIELD]: z.boolean().default(true),
});
/**
 * Register the durable wallpaper section when the optional settings service
 * is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function applySettings(ctx) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(WALLPAPER_SETTINGS_NAMESPACE, WallpaperSettingsSchema);
    });
}
