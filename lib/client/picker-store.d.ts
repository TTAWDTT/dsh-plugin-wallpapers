/**
 * Wallpaper picker slot store: a mirror of the wallpapers RPC roster and
 * the durable selection. The plugin's apply world is the only writer (via the
 * baked actions captured at registration); components read via props.useStore.
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client';
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
import type { WallpaperRoster, WallpaperSummary } from '../host/types.ts';
import { type WallpaperSettings } from '../wallpaper-settings.ts';
/** The roster, or the message to show in its place. */
export type RosterRead = {
    ok: true;
    value: WallpaperRoster;
} | {
    ok: false;
    error: string;
};
/** The empty roster a deployment without the wallpapers service answers. */
export declare const EMPTY_ROSTER: WallpaperRoster;
/**
 * Read the roster over the self-mounted `/wallpapers-roster` channel, turning
 * a refusal into the message every surface shows.
 * @param ctx - the browser plugin context carrying the connection service.
 * @returns the roster, or the message to show in its place.
 */
export declare function readRoster(ctx: {
    connection: ConnectionHandle;
}): Promise<RosterRead>;
/** Everything the picker surfaces render. */
export interface WallpaperPickerState {
    /** Load gate: roster fetch in flight. */
    status: 'idle' | 'loading' | 'ready' | 'error';
    /** The last roster error message, null while no error is shown. */
    error: string | null;
    /** Every wallpaper the host answered with, in roster order. */
    wallpapers: readonly WallpaperSummary[];
    /** Whether any Steam root was found (drives the "not installed" copy). */
    steamRootsFound: boolean;
    /** Whether the Wallpaper Engine install itself resolved. */
    installFound: boolean;
    /** The stored selection (`<collection>:<id>`), empty for none. */
    selection: string;
    /** Whether background audio is muted. */
    muted: boolean;
    /** The visible title text of the current selection, for the row. */
    selectedTitle: string | null;
    /** Whether the picker dialog is showing. */
    dialogOpen: boolean;
}
/** Declared action shape giving the exported factory a stable return type. */
type WallpaperPickerActions = {
    /**
     * Fold one apply-world observation into the mirror. Every call carries the
     * full truth (status + error + roster + durable section), so the last call
     * wins and no revision guard can drop a newer durable value behind an
     * older roster echo; the apply world owns ordering instead.
     */
    sync: (draft: WallpaperPickerState, status: WallpaperPickerState['status'], error: string | null, roster: WallpaperRoster, selection: string, muted: boolean) => void;
    /** Open or close the picker dialog (UI-local state, no durable twin). */
    dialog: (draft: WallpaperPickerState, open: boolean) => void;
};
/**
 * Declares the picker state and write surface; the plugin's apply world is
 * the only writer.
 * @returns the store handle.
 */
export declare function createWallpaperPickerStore(): EngineStoreHandle<WallpaperPickerState, WallpaperPickerActions>;
/**
 * Read the durable section off a settings-scope snapshot.
 * @param value - the scope document's value, when the document has one.
 * @returns the section fields with schema defaults filled in.
 */
export declare function readSettings(value: Partial<WallpaperSettings> | undefined): {
    selection: string;
    muted: boolean;
};
/**
 * Persist one selection through the settings scope. The value is the
 * `<collection>:<id>` wire form, or the empty string for none.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param selection - the value to write.
 */
export declare function writeSelection(scope: {
    set: (field: string, value: unknown) => Promise<void>;
}, selection: string): Promise<void>;
/**
 * Persist the mute preference through the settings scope.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param muted - the value to write.
 */
export declare function writeMuted(scope: {
    set: (field: string, value: unknown) => Promise<void>;
}, muted: boolean): Promise<void>;
export {};
