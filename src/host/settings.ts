/**
 * Host registration for the browser wallpaper preference: the durable
 * `ui-wallpaper` settings section carrying the selected wallpaper id and the
 * mute preference. The selection is a dsh-Web-UI background choice only —
 * nothing here reaches the Windows desktop wallpaper.
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import {
  WALLPAPER_MUTE_FIELD, WALLPAPER_SELECTION_FIELD, WALLPAPER_SETTINGS_NAMESPACE,
  type WallpaperSettings,
} from '../wallpaper-settings.ts'

export {
  DEFAULT_WALLPAPER_MUTED, WALLPAPER_MUTE_FIELD, WALLPAPER_SELECTION_FIELD,
  WALLPAPER_SETTINGS_NAMESPACE,
  type WallpaperSettings,
} from '../wallpaper-settings.ts'

/** Durable wallpaper section shared by the Host schema and the browser scope. */
export const WallpaperSettingsSchema: z<WallpaperSettings> = z.object({
  [WALLPAPER_SELECTION_FIELD]: z.string().default(''),
  [WALLPAPER_MUTE_FIELD]: z.boolean().default(true),
})

/**
 * Register the durable wallpaper section when the optional settings service
 * is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function applySettings(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(WALLPAPER_SETTINGS_NAMESPACE, WallpaperSettingsSchema)
  })
}
