import { WallpaperDialog } from "./WallpaperDialog.js";
import { WallpaperRow } from "./WallpaperRow.js";
import { en, zh } from "./locales.js";
import { createWallpaperPickerStore, readRoster, readSettings, writeMuted, writeSelection, } from "./picker-store.js";
import layerCss from './wallpaper-layer.css?inline';
import { mountWallpaperLayer, TRANSLUCENT_TOKENS } from "./wallpaper-layer.js";
import { parseSelection, WALLPAPER_SETTINGS_NAMESPACE } from "../wallpaper-settings.js";
/** Mount the stage stylesheet for the plugin lifetime. */
function installLayerStyles(ctx) {
    if (typeof document === 'undefined')
        return;
    ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = '@deepseek-ai/dsh-client-ui-wallpaper';
        tag.textContent = layerCss;
        document.head.appendChild(tag);
        return () => { tag.remove(); };
    }, 'ui-wallpaper: layer stylesheet');
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
export const inject = ['slots', 'locale', 'remote', 'connection', 'settingsScope', 'theme'];
/**
 * Client plugin body: bind the settings scope, run the stage controller,
 * register the localized row and dialog.
 * @param ctx - client cordis context.
 */
export function apply(ctx) {
    installLayerStyles(ctx);
    const host = ctx.settingsScope.bind({ namespace: WALLPAPER_SETTINGS_NAMESPACE });
    const store = createWallpaperPickerStore();
    let bound;
    /** The live roster (empty until the first read lands). */
    let roster = { wallpapers: [], steamRootsFound: false, installFound: false };
    /** Resolve the summary one stored selection names, from the live roster. */
    const resolve = (selection) => {
        const parsed = parseSelection(selection);
        if (parsed === undefined)
            return undefined;
        return roster.wallpapers.find(w => w.collection === parsed.collection && w.id === parsed.id);
    };
    /**
     * The layer + theme-override controller: exactly one live disposer pair at
     * a time, replaced whenever the composed view (selection × roster × mute)
     * changes. Restaging is keyed by the mounted entry URL and mute flag so
     * unrelated store echoes do not remount the media element.
     */
    let layerDispose;
    let overrideDispose;
    let mountedUrl;
    let mountedMuted;
    const restage = () => {
        const section = readSettings(host.getSnapshot().value);
        const summary = resolve(section.selection);
        const url = summary?.entryUrl ?? undefined;
        const muted = section.muted;
        if (url === mountedUrl && muted === mountedMuted)
            return;
        layerDispose?.();
        overrideDispose?.();
        layerDispose = undefined;
        overrideDispose = undefined;
        mountedUrl = url;
        mountedMuted = muted;
        if (summary === undefined || summary.entryUrl === null) {
            // No selection (or an unsupported one): the stage is down and the theme
            // override retracted, so the base palette shows through again.
            return;
        }
        layerDispose = mountWallpaperLayer(summary, muted);
        overrideDispose = ctx.theme.overrideTokens('ui-wallpaper', { ...TRANSLUCENT_TOKENS });
    };
    ctx.effect(() => () => {
        layerDispose?.();
        overrideDispose?.();
    }, 'ui-wallpaper: stage teardown');
    /**
     * Fold one apply-world observation into the store mirror and the stage.
     * Every call carries the full truth (roster + durable section), so the
     * last call wins and ordering belongs to the apply world alone.
     */
    const push = (status, error) => {
        const section = readSettings(host.getSnapshot().value);
        bound?.sync(status, error, roster, section.selection, section.muted);
        restage();
    };
    ctx.effect(() => host.subscribe(() => { push('ready', null); }), 'ui-wallpaper: settings scope adoption');
    // Roster refresh: needed before the row can title the selection and before
    // the stage can resolve an entry URL. Re-run whenever the dialog opens.
    let readToken = 0;
    const refresh = async () => {
        const token = ++readToken;
        // Host merge types `connection` as HostConnectionHandle; the browser
        // service is the client handle (the subscriptions pattern's double cast).
        const rosterRead = await readRoster({ connection: ctx.get('connection') });
        if (token !== readToken)
            return; // a newer read superseded this one
        if (rosterRead.ok) {
            roster = rosterRead.value;
        }
        push(rosterRead.ok ? 'ready' : 'error', rosterRead.ok ? null : rosterRead.error);
    };
    void refresh();
    ctx.effect(() => ctx.locale.register('ui-wallpaper', { zh, en }), 'ui-wallpaper: dictionaries');
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'wallpaper',
        order: 12,
        store,
        locale: 'ui-wallpaper',
        inject: (actions) => {
            bound = actions;
            return {
                openWallpaperDialog: () => {
                    actions.dialog(true);
                    void refresh();
                },
            };
        },
    }, WallpaperRow));
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'wallpaper-dialog',
        order: 13,
        store,
        locale: 'ui-wallpaper',
        inject: (actions) => {
            bound = actions;
            return {
                selectWallpaper: (selection) => {
                    void writeSelection(host, selection);
                    // Optimistic: the durable write echoes back through the scope
                    // subscription, but the stage must not wait for the wire.
                    bound?.sync('ready', null, roster, selection, readSettings(host.getSnapshot().value).muted);
                },
                closeWallpaperDialog: () => {
                    actions.dialog(false);
                },
                setWallpaperMuted: (muted) => {
                    void writeMuted(host, muted);
                    bound?.sync('ready', null, roster, readSettings(host.getSnapshot().value).selection, muted);
                },
            };
        },
    }, WallpaperDialog));
}
