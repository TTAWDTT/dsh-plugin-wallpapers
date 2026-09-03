/** Wallpaper preferences stored in the Host user-settings document. */
/** Settings namespace owned by the wallpaper plugin. */
export const WALLPAPER_SETTINGS_NAMESPACE = 'ui-wallpaper';
/** Field carrying the selected wallpaper (`<collection>:<id>`, empty for none). */
export const WALLPAPER_SELECTION_FIELD = 'selection';
/** Field carrying the background audio mute preference. */
export const WALLPAPER_MUTE_FIELD = 'muted';
/** Mute default: video backgrounds stay silent until the user opts in. */
export const DEFAULT_WALLPAPER_MUTED = true;
/**
 * Split one stored selection value into its collection and id halves.
 * @param selection - the stored `<collection>:<id>` value.
 * @returns the pair, or undefined when the value is empty or malformed.
 */
export function parseSelection(selection) {
    if (selection.length === 0)
        return undefined;
    const at = selection.indexOf(':');
    if (at <= 0 || at === selection.length - 1)
        return undefined;
    const collection = selection.slice(0, at);
    return collection === 'workshop' || collection === 'bundled'
        ? { collection, id: selection.slice(at + 1) }
        : undefined;
}
