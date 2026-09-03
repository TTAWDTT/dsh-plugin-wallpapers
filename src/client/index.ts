/**
 * Browser wallpaper plugin: mounts the background layer for the selected
 * Wallpaper Engine wallpaper, registers the General-section preference row,
 * and opens the picker dialog. The selection and mute preference live in the
 * durable `ui-wallpaper` settings section; the roster comes over the
 * self-mounted `/wallpapers-roster` connection channel. dsh's own background
 * is what changes — the Windows desktop wallpaper is never touched.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: the ctx.settingsScope Context merge. Cross-plugin collaboration
// goes through the service, never a value import (client bundle purity gate).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the ThemeRuntime service merge (ctx.theme).
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type { WallpaperRoster, WallpaperSummary } from '../host/types.ts'
import { WallpaperDialog } from './WallpaperDialog.tsx'
import { WallpaperRow } from './WallpaperRow.tsx'
import { en, zh, type WallpaperKey } from './locales.ts'
import {
  createWallpaperPickerStore, readRoster, readSettings, writeMuted, writeSelection,
} from './picker-store.ts'
import layerCss from './wallpaper-layer.css?inline'
import { mountWallpaperLayer, TRANSLUCENT_TOKENS } from './wallpaper-layer.ts'
import { parseSelection, WALLPAPER_SETTINGS_NAMESPACE, type WallpaperSettings } from '../wallpaper-settings.ts'

export type { WallpaperDialogComponentProps, WallpaperDialogInjected } from './WallpaperDialog.tsx'
export type { WallpaperRowComponentProps, WallpaperRowInjected } from './WallpaperRow.tsx'
export type { RosterRead, WallpaperPickerState } from './picker-store.ts'
export type { WallpaperKey } from './locales.ts'
export type { WallpaperSettings } from '../wallpaper-settings.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The wallpaper row and dialog's copy. */
    'ui-wallpaper': WallpaperKey
  }
}

/** Mount the stage stylesheet for the plugin lifetime. */
function installLayerStyles(ctx: ClientContext): void {
  if (typeof document === 'undefined') return
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = '@deepseek-ai/dsh-client-ui-wallpaper'
    tag.textContent = layerCss
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'ui-wallpaper: layer stylesheet')
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
export const inject = ['slots', 'locale', 'remote', 'connection', 'settingsScope', 'theme']

/**
 * Client plugin body: bind the settings scope, run the stage controller,
 * register the localized row and dialog.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  installLayerStyles(ctx)
  const host = ctx.settingsScope.bind<WallpaperSettings>({ namespace: WALLPAPER_SETTINGS_NAMESPACE })
  const store = createWallpaperPickerStore()
  let bound: BoundActions<typeof store> | undefined

  /** The live roster (empty until the first read lands). */
  let roster: WallpaperRoster = { wallpapers: [], steamRootsFound: false, installFound: false }

  /** Resolve the summary one stored selection names, from the live roster. */
  const resolve = (selection: string): WallpaperSummary | undefined => {
    const parsed = parseSelection(selection)
    if (parsed === undefined) return undefined
    return roster.wallpapers.find(w => w.collection === parsed.collection && w.id === parsed.id)
  }

  /**
   * The layer + theme-override controller: exactly one live disposer pair at
   * a time, replaced whenever the composed view (selection × roster × mute)
   * changes. Restaging is keyed by the mounted entry URL and mute flag so
   * unrelated store echoes do not remount the media element.
   */
  let layerDispose: (() => void) | undefined
  let overrideDispose: (() => void) | undefined
  let mountedUrl: string | undefined
  let mountedMuted: boolean | undefined
  const restage = (): void => {
    const section = readSettings(host.getSnapshot().value)
    const summary = resolve(section.selection)
    const url = summary?.entryUrl ?? undefined
    const muted = section.muted
    if (url === mountedUrl && muted === mountedMuted) return
    layerDispose?.()
    overrideDispose?.()
    layerDispose = undefined
    overrideDispose = undefined
    mountedUrl = url
    mountedMuted = muted
    if (summary === undefined || summary.entryUrl === null) {
      // No selection (or an unsupported one): the stage is down and the theme
      // override retracted, so the base palette shows through again.
      return
    }
    layerDispose = mountWallpaperLayer(summary, muted)
    overrideDispose = ctx.theme.overrideTokens('ui-wallpaper', { ...TRANSLUCENT_TOKENS })
  }
  ctx.effect(() => () => {
    layerDispose?.()
    overrideDispose?.()
  }, 'ui-wallpaper: stage teardown')

  /**
   * Fold one apply-world observation into the store mirror and the stage.
   * Every call carries the full truth (roster + durable section), so the
   * last call wins and ordering belongs to the apply world alone.
   */
  const push = (status: 'idle' | 'loading' | 'ready' | 'error', error: string | null): void => {
    const section = readSettings(host.getSnapshot().value)
    bound?.sync(status, error, roster, section.selection, section.muted)
    restage()
  }

  ctx.effect(() => host.subscribe(() => { push('ready', null) }),
    'ui-wallpaper: settings scope adoption')

  // Roster refresh: needed before the row can title the selection and before
  // the stage can resolve an entry URL. Re-run whenever the dialog opens.
  let readToken = 0
  const refresh = async (): Promise<void> => {
    const token = ++readToken
    // Host merge types `connection` as HostConnectionHandle; the browser
    // service is the client handle (the subscriptions pattern's double cast).
    const rosterRead = await readRoster({ connection: ctx.get('connection') as unknown as ConnectionHandle })
    if (token !== readToken) return // a newer read superseded this one
    if (rosterRead.ok) {
      roster = rosterRead.value
    }
    push(rosterRead.ok ? 'ready' : 'error', rosterRead.ok ? null : rosterRead.error)
  }
  void refresh()

  ctx.effect(() => ctx.locale.register('ui-wallpaper', { zh, en }), 'ui-wallpaper: dictionaries')

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'wallpaper',
    order: 12,
    store,
    locale: 'ui-wallpaper',
    inject: (actions: BoundActions<typeof store>): import('./WallpaperRow.tsx').WallpaperRowInjected => {
      bound = actions
      return {
        openWallpaperDialog: () => {
          actions.dialog(true)
          void refresh()
        },
      }
    },
  }, WallpaperRow))

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'wallpaper-dialog',
    order: 13,
    store,
    locale: 'ui-wallpaper',
    inject: (actions: BoundActions<typeof store>): import('./WallpaperDialog.tsx').WallpaperDialogInjected => {
      bound = actions
      return {
        selectWallpaper: (selection: string) => {
          void writeSelection(host, selection)
          // Optimistic: the durable write echoes back through the scope
          // subscription, but the stage must not wait for the wire.
          bound?.sync('ready', null, roster, selection, readSettings(host.getSnapshot().value).muted)
        },
        closeWallpaperDialog: () => {
          actions.dialog(false)
        },
        setWallpaperMuted: (muted: boolean) => {
          void writeMuted(host, muted)
          bound?.sync('ready', null, roster, readSettings(host.getSnapshot().value).selection, muted)
        },
      }
    },
  }, WallpaperDialog))
}
