/**
 * Wallpaper Engine discovery: Steam library roots from `libraryfolders.vdf`,
 * the Wallpaper Engine install under the library owning app 431960, workshop
 * content, bundled defaultprojects, and `project.json` parsing.
 *
 * Plain-text VDF parsing (no dependency): the file nests braces with
 * quoted key-value pairs, and every field discovery reads is a quoted scalar
 * whose value never contains a quote, so a tokenizer over quotes, braces, and
 * whitespace is exact for this input.
 * @module discovery
 */
import { access, readdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
/** Wallpaper Engine's Steam app id. */
export const WALLPAPER_ENGINE_APP_ID = '431960';
/** VDF key Steam writes under every library folder entry. */
const VDF_PATH_KEY = 'path';
/** VDF table Steam writes the library list under. */
const VDF_ROOT_KEY = 'libraryfolders';
/**
 * Parse every `path` value in `libraryfolders.vdf`, in file order.
 * @param vdf - file text.
 * @returns library root paths with escaped backslashes folded.
 */
export function parseLibraryRoots(vdf) {
    const roots = [];
    const at = vdf.indexOf(`"${VDF_ROOT_KEY}"`);
    const body = at === -1 ? vdf : vdf.slice(at);
    const pairs = body.matchAll(new RegExp(`"${VDF_PATH_KEY}"\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g'));
    for (const pair of pairs) {
        // VDF escapes `\` as `\\`; Steam itself also tolerates single ones, and
        // folding both through JSON.parse accepts either.
        const raw = pair[1] ?? '';
        try {
            roots.push(JSON.parse(`"${raw}"`));
        }
        catch {
            roots.push(raw.replaceAll('\\\\', '\\'));
        }
    }
    return roots;
}
/**
 * Read the Steam library roots that own Wallpaper Engine.
 * @param steamRoot - Steam root containing `steamapps`.
 * @param appId - Steam app id to look up (defaults to Wallpaper Engine's).
 * @returns library roots where the app is installed, in file order.
 */
export async function discoverWallpaperEngineLibraries(steamRoot, appId = WALLPAPER_ENGINE_APP_ID) {
    const vdfPath = join(steamRoot, 'steamapps', 'libraryfolders.vdf');
    let vdf;
    try {
        vdf = await readFile(vdfPath, 'utf8');
    }
    catch {
        return [];
    }
    const text = vdf.replaceAll('\t', ' ');
    const roots = [];
    // Split at each `path` pair, then ask whether the table that follows owns
    // the app id: the `apps` table always comes after its folder's `path`.
    const marker = new RegExp(`"${VDF_PATH_KEY}"\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'g');
    const matches = [...text.matchAll(marker)];
    const adopt = (raw, segment) => {
        if (!segment.includes(`"${appId}"`))
            return;
        let root;
        try {
            root = JSON.parse(`"${raw}"`);
        }
        catch {
            root = raw.replaceAll('\\\\', '\\');
        }
        roots.push(root);
    };
    // Walk with the previous match as the anchor: the region from a `path`
    // pair up to the next one (or the end of the file) is the table that may
    // contain the app id. This avoids indexed lookahead, on which the lint
    // and type models disagree.
    let anchor;
    for (const match of matches) {
        if (anchor !== undefined)
            adopt(anchor.raw, text.slice(anchor.index, match.index));
        anchor = { index: match.index, raw: match[1] ?? '' };
    }
    if (anchor !== undefined)
        adopt(anchor.raw, text.slice(anchor.index));
    return roots;
}
/**
 * Classify one wallpaper's `project.json` `type` field.
 * @param raw - the field value, or undefined when absent.
 * @returns the lowercase kind, `unknown` for anything unlisted.
 */
export function wallpaperKind(raw) {
    const text = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    return text === 'scene' || text === 'video' || text === 'web' ? text : 'unknown';
}
/** Property types whose value reaches the browser unchanged. */
const KNOWN_PROPERTY_TYPES = new Set([
    'bool', 'slider', 'color', 'text', 'combo', 'textinput', 'group', 'usershortcut',
]);
/** Whether one parsed properties table entry is user-adjustable. */
function isAdjustable(entry) {
    if (typeof entry !== 'object' || entry === null)
        return false;
    const record = entry;
    if (typeof record.type !== 'string' || !KNOWN_PROPERTY_TYPES.has(record.type))
        return false;
    // The Wallpaper Engine UI hides usershortcut rows behind a per-user hotkey
    // binding dsh cannot render; everything else with a declared value is shown.
    if (record.type === 'usershortcut')
        return false;
    return typeof record.value === 'string' || typeof record.value === 'number' || typeof record.value === 'boolean';
}
/**
 * Extract the user-adjustable properties from one project.json.
 * @param general - the parsed `general` object, or undefined.
 * @returns properties in project.json order, `schemecolor` first like the
 * Wallpaper Engine UI does when an order field is absent.
 */
export function parseProperties(general) {
    const table = general?.properties;
    if (typeof table !== 'object' || table === null)
        return [];
    const properties = [];
    let index = 0;
    for (const [key, entry] of Object.entries(table)) {
        if (!isAdjustable(entry))
            continue;
        const order = typeof entry.order === 'number'
            ? entry.order
            : index;
        properties.push({
            key,
            text: typeof entry.text === 'string'
                ? entry.text
                : key,
            type: entry.type,
            value: entry.value,
            ...(entry.type === 'combo' && Array.isArray(entry.options)
                ? {
                    options: (entry.options)
                        .filter(option => typeof option === 'object' && option !== null
                        && typeof option.label === 'string'
                        && typeof option.value === 'string')
                        .map(option => ({
                        label: option.label,
                        value: option.value,
                    })),
                }
                : {}),
            order,
        });
        index += 1;
    }
    return properties
        .sort((left, right) => left.order - right.order)
        .map(({ order: _order, ...property }) => property);
}
/**
 * Parse one wallpaper directory's `project.json`.
 * @param projectPath - absolute path of the file.
 * @returns the parsed JSON object, or undefined when absent or unreadable.
 */
export async function readProjectJson(projectPath) {
    try {
        const text = await readFile(projectPath, 'utf8');
        // Wallpaper Engine writes plain UTF-8; a BOM survives some editors, and
        // JSON.parse rejects it, so strip one before parsing.
        return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
    }
    catch {
        return undefined;
    }
}
/**
 * Scan one collection directory for wallpaper directories.
 * @param root - absolute directory whose immediate children are wallpapers.
 * @param collection - which collection the scan serves.
 * @returns one entry per child carrying a `project.json`, sorted by id.
 */
export async function scanCollection(root, collection) {
    let names;
    try {
        names = await readdir(root);
    }
    catch {
        return [];
    }
    const found = await Promise.all(names.map(async (id) => {
        const projectPath = join(root, id, 'project.json');
        const project = await readProjectJson(projectPath);
        return project === undefined ? undefined : { collection, id, projectPath };
    }));
    return found
        .filter((entry) => entry !== undefined)
        .sort((left, right) => left.id.localeCompare(right.id));
}
/** Whether one candidate directory is a Steam root: it holds `steamapps`. */
async function isSteamRoot(candidate) {
    try {
        await access(join(candidate, 'steamapps'));
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Parse one `reg query ... /v SteamPath` stdout.
 * @param stdout - the reg tool's output text.
 * @returns the Steam path with Steam's forward slashes folded to backslashes,
 * or undefined when no value line is present.
 */
export function parseRegSteamPath(stdout) {
    const match = /SteamPath\s+REG_SZ\s+(.+)/.exec(stdout);
    const raw = match?.[1]?.trim();
    return raw === undefined || raw === '' ? undefined : raw.replaceAll('/', '\\');
}
/**
 * Windows-only: read `HKCU\Software\Valve\Steam\SteamPath` via `reg query`.
 * The registry write is part of every Steam install, so this resolves the
 * root even when Steam sits outside the usual Program Files location.
 * @returns the Steam root, or undefined when reg is absent or the key is.
 */
async function windowsSteamPath() {
    try {
        const { stdout } = await execFileAsync('reg', ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath']);
        // Output lines carry `<name>    <type>    <value>`; the value is the last
        // whitespace-separated token, and Steam writes it with forward slashes.
        return parseRegSteamPath(stdout);
    }
    catch {
        return undefined;
    }
}
/**
 * Detect Steam's installation root without configuration: the Windows
 * registry (via `reg query`), then the standard install locations per
 * platform. Every known library — not just the root's own — is still found
 * afterwards through `libraryfolders.vdf`, so only the first root has to be
 * right.
 * @returns candidate Steam roots in probe order, deduplicated.
 */
export async function detectSteamRoots() {
    const candidates = [];
    if (platform() === 'win32') {
        const registry = await windowsSteamPath();
        if (registry !== undefined)
            candidates.push(registry);
        candidates.push(join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Steam'), join(process.env['ProgramFiles'] ?? 'C:\\Program Files', 'Steam'));
    }
    else if (process.platform === 'darwin') {
        candidates.push(join(homedir(), 'Library', 'Application Support', 'Steam'));
    }
    else {
        candidates.push(join(homedir(), '.steam', 'steam'), join(homedir(), '.local', 'share', 'Steam'));
    }
    const checked = await Promise.all(candidates.map(async (candidate) => await isSteamRoot(candidate) ? candidate : undefined));
    const roots = checked.filter((root) => root !== undefined);
    return [...new Set(roots)];
}
