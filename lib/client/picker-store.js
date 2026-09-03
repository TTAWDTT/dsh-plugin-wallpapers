import { defineStore } from '@deepseek-ai/dsh-client-store';
import { parseSelection } from "../wallpaper-settings.js";
/** The empty roster a deployment without the wallpapers service answers. */
export const EMPTY_ROSTER = { wallpapers: [], steamRootsFound: false, installFound: false };
/** Host-face mirror of the channel constant (`@deepseek-ai/dsh-host-wallpapers` is type-only here). */
const WALLPAPERS_RPC_CHANNEL = '/wallpapers-roster';
/**
 * Read the roster over the self-mounted `/wallpapers-roster` channel, turning
 * a refusal into the message every surface shows.
 * @param ctx - the browser plugin context carrying the connection service.
 * @returns the roster, or the message to show in its place.
 */
export async function readRoster(ctx) {
    // Wallpaper Engine integration is optional: without the host plugin the
    // channel route is absent, the call throws a transport failure (HTTP 404
    // from the connection bridge), and the picker shows the same empty roster
    // a mounted plugin with no install answers, so the row still opens and the
    // dialog explains the absence.
    try {
        const result = await ctx.connection.rpc.call(WALLPAPERS_RPC_CHANNEL, 'list', {});
        if (result.ok)
            return { ok: true, value: result.value };
        return { ok: false, error: result.error.message };
    }
    catch {
        // The channel is absent (headless composition, or the host plugin is not
        // installed): the empty roster keeps every surface rendering.
        return { ok: true, value: EMPTY_ROSTER };
    }
}
/**
 * Declares the picker state and write surface; the plugin's apply world is
 * the only writer.
 * @returns the store handle.
 */
export function createWallpaperPickerStore() {
    return defineStore({
        init: () => ({
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
                d.status = status;
                d.error = error;
                d.wallpapers = roster.wallpapers;
                d.steamRootsFound = roster.steamRootsFound;
                d.installFound = roster.installFound;
                d.selection = selection;
                d.muted = muted;
                d.selectedTitle = resolveTitle(roster.wallpapers, selection);
            },
            dialog: (d, open) => { d.dialogOpen = open; },
        },
    });
}
/**
 * The visible title of one selection.
 * @param wallpapers - the roster.
 * @param selection - the stored `<collection>:<id>` value.
 * @returns the title, or null for an empty or unknown selection.
 */
function resolveTitle(wallpapers, selection) {
    const parsed = parseSelection(selection);
    if (parsed === undefined)
        return null;
    return wallpapers.find(w => w.collection === parsed.collection && w.id === parsed.id)?.title ?? null;
}
/**
 * Read the durable section off a settings-scope snapshot.
 * @param value - the scope document's value, when the document has one.
 * @returns the section fields with schema defaults filled in.
 */
export function readSettings(value) {
    const section = value ?? {};
    return {
        selection: typeof section.selection === 'string' ? section.selection : '',
        muted: typeof section.muted === 'boolean' ? section.muted : true,
    };
}
/**
 * Persist one selection through the settings scope. The value is the
 * `<collection>:<id>` wire form, or the empty string for none.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param selection - the value to write.
 */
export async function writeSelection(scope, selection) {
    await scope.set('selection', selection);
}
/**
 * Persist the mute preference through the settings scope.
 * @param scope - the bound ui-wallpaper settings scope.
 * @param muted - the value to write.
 */
export async function writeMuted(scope, muted) {
    await scope.set('muted', muted);
}
