/**
 * Wallpaper picker slot store: a mirror of the wallpapers RPC roster and
 * the durable selection. The plugin's apply world is the only writer (via the
 * baked actions captured at registration); components read via props.useStore.
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { WallpaperRoster, WallpaperSummary } from '../host/types.ts'
import { parseSelection, type WallpaperSettings } from '../wallpaper-settings.ts'

/** The roster, or the message to show in its place. */
export type RosterRead = { ok: true; value: WallpaperRoster } | { ok: false; error: string }

/** The empty roster a deployment without the wallpapers service answers. */
export const EMPTY_ROSTER: WallpaperRoster = { wallpapers: [], steamRootsFound: false, installFound: false }

/** Host-face mirror of the channel constant (`@deepseek-ai/dsh-host-wallpapers` is type-only here). */
const WALLPAPERS_RPC_CHANNEL = '/wallpapers-roster'

/**
 * Read the roster over the self-mounted `/wallpapers-roster` channel, turning
 * a refusal into the message every surface shows.
 * @param ctx - the browser plugin context carrying the connection service.
 * @returns the roster, or the message to show in its place.
 */
export async function readRoster(ctx: { connection: ConnectionHandle }): Promise<RosterRead> {
  // Wallpaper Engine integration is optional: without the host plugin the
  // channel route is absent, the call throws a transport failure (HTTP 404
  // from the connection bridge), and the picker shows the same empty roster
  // a mounted plugin with no install answers, so the row still opens and the
  // dialog explains the absence.
  try {
    const result = await ctx.connection.rpc.call(WALLPAPERS_RPC_CHANNEL, 'list', {})
    if (result.ok) return { ok: true, value: result.value as WallpaperRoster }
    return { ok: false, error: result.error.message }
  } catch {
    // The channel is absent (headless composition, or the host plugin is not
    // installed): the empty roster keeps every surface rendering.
    return { ok: true, value: EMPTY_ROSTER }
  }
}

/** Everything the picker surfaces render. */
export interface WallpaperPickerState {
  /** Load gate: roster fetch in flight. */
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** The last roster error message, null while no error is shown. */
  error: string | null
  /** Every wallpaper the host answered with, in roster order. */
  wallpapers: readonly WallpaperSummary[]
  /** Whether any Steam root was found (drives the "not installed" copy). */
  steamRootsFound: boolean
  /** Whether the Wallpaper Engine install itself resolved. */
  installFound: boolean
  /** The stored selection (`<collection>:<id>`), empty for none. */
  selection: string
  /** Whether background audio is muted. */
  muted: boolean
  /** The visible title text of the current selection, for the row. */
  selectedTitle: string | null
  /** Whether the picker dialog is showing. */
  dialogOpen: boolean
}

/** Declared action shape giving the exported factory a stable return type. */
type WallpaperPickerActions = {
  /**
   * Fold one apply-world observation into the mirror. Every call carries the
   * full truth (status + error + roster + durable section), so the last call
   * wins and no revision guard can drop a newer durable value behind an
   * older roster echo; the apply world owns ordering instead.
   */
  sync: (
    draft: WallpaperPickerState,
    status: WallpaperPickerState['status'],
    error: string | null,
    roster: WallpaperRoster,
    selection: string,
    muted: boolean,
  ) => void
  /** Open or close the picker dialog (UI-local state, no durable twin). */
  dialog: (draft: WallpaperPickerState, open: boolean) => void
}

/**
 * Declares the picker state and write surface; the plugin's apply world is
 * the only writer.
 * @returns the store handle.
 */
export function createWallpaperPickerStore(): EngineStoreHandle<WallpaperPickerState, WallpaperPickerActions> {
  return defineStore<WallpaperPickerState, WallpaperPickerActions>({
    init: (): WallpaperPickerState => ({
      status: 'idle',
      error: null,
      wallpapers: EMPTY_ROSTER.wallpapers,
      steamRootsFound: false,
      installFound: false,
      selection: '',
      muted: true,
      selectedTitle: null,
      dialogOpen: false,
    }),
    actions: {
      sync: (d, status, error, roster, selection, muted) => {
        d.status = status
        d.error = error
        d.wallpapers = roster.wallpapers
        d.steamRootsFound = roster.steamRootsFound
        d.installFound = roster.installFound
        d.selection = selection
        d.muted = muted
        d.selectedTitle = resolveTitle(roster.wallpapers, selection)
      },
      dialog: (d, open) => { d.dialogOpen = open },
    },
  })
}

/**
 * The visible title of one selection.
 * @param wallpapers - the roster.
 * @param selection - the stored `<collection>:<id>` value.
 * @returns the title, or null for an empty or unknown selection.
 */
function resolveTitle(
  wallpapers: readonly WallpaperSummary[], selection: string,
): string | null {
  const parsed = parseSelection(selection)
  if (parsed === undefined) return null
  return wallpapers.find(w => w.collection === parsed.collection && w.id === parsed.id)?.title ?? null
}

/**
 * Read the durable section off a settings-scope snapshot.
 * @param value - the scope document's value, when the document has one.
 * @returns the section fields with schema defaults filled in.
 */
export function readSettings(
  value: Partial<WallpaperSettings> | undefined,
): { selection: string; muted: boolean } {
  const section = value ?? {}
  return {
    selection: typeof section.selection === 'string' ? section.selection : '',
    muted: typeof section.muted === 'boolean' ? section.muted : true,
  }
}

/**
 * Persist one selection through the settings scope. The value is the
 * `<collection>:<id>` wire form, or the empty string for none.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param selection - the value to write.
 */
export async function writeSelection(
  scope: { set: (field: string, value: unknown) => Promise<void> },
  selection: string,
): Promise<void> {
  await scope.set('selection', selection)
}

/**
 * Persist the mute preference through the settings scope.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param muted - the value to write.
 */
export async function writeMuted(
  scope: { set: (field: string, value: unknown) => Promise<void> },
  muted: boolean,
): Promise<void> {
  await scope.set('muted', muted)
}
