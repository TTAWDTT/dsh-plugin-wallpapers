window.__ModuleLoader__.load({ id: "dsh-plugin-wallpapers", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let react = require("react");
react = __toESM(react);
let __deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
__deepseek_ai_dsh_client_ui_primitives = __toESM(__deepseek_ai_dsh_client_ui_primitives);
let react_jsx_runtime = require("react/jsx-runtime");
react_jsx_runtime = __toESM(react_jsx_runtime);
let __deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
__deepseek_ai_dsh_client_store = __toESM(__deepseek_ai_dsh_client_store);

//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
var clsx_default = clsx;

//#endregion
//#region \0dsh-css:D:\Github\dsh\dsh-plugin-wallpapers\src\client\WallpaperDialog.module.css.mjs
const css$1 = ".opF6ra_pickerDialog.opF6ra_pickerDialog{width:min(720px,100%)}.opF6ra_content{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);flex-direction:column;gap:12px;height:min(560px,100dvh - 96px);min-height:0;display:flex}.opF6ra_content>*{min-height:0}.opF6ra_toolbar{flex:none;align-items:center;gap:12px;display:flex}.opF6ra_search{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);font:inherit;color:var(--dsw-alias-label-primary);border-radius:10px;outline:none;flex:auto;padding:6px 12px;font-size:13px}.opF6ra_search:focus{border-color:var(--dsw-alias-border-l4)}.opF6ra_kinds{gap:4px;display:flex}.opF6ra_kind{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:8px;padding:4px 12px;font-size:13px;line-height:18px}.opF6ra_kind:hover{color:var(--dsw-alias-label-primary)}.opF6ra_kindSelected{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.opF6ra_gridWrap{flex:auto;min-height:0;padding-right:4px;overflow-y:auto}.opF6ra_grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));align-content:start;gap:12px;display:grid}.opF6ra_card{border:.5px solid var(--dsw-alias-border-l4);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border-radius:12px;flex-direction:column;gap:8px;padding:0;display:flex;position:relative;overflow:hidden}.opF6ra_card:hover{background:var(--dsw-alias-interactive-bg-hover)}.opF6ra_cardSelected{border-color:var(--dsw-alias-brand-primary)}.opF6ra_cardUnsupported{opacity:.45;cursor:not-allowed}.opF6ra_thumb{aspect-ratio:16/9;background:var(--dsw-alias-bg-layer-1);flex:none;width:100%;display:block}.opF6ra_thumbImage{object-fit:cover;width:100%;height:100%;display:block}.opF6ra_thumbFallback{width:100%;height:100%;display:block}.opF6ra_meta{flex-direction:column;gap:2px;padding:0 12px 10px;display:flex}.opF6ra_name{text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:18px;overflow:hidden}.opF6ra_sub{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}.opF6ra_badge{background:var(--dsw-alias-brand-primary);color:#fff;border-radius:6px;padding:2px 8px;font-size:11px;line-height:14px;position:absolute;top:8px;right:8px}.opF6ra_note{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.opF6ra_noteError{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}.opF6ra_audio{color:var(--dsw-alias-label-primary);flex:none;align-items:center;gap:8px;font-size:13px;line-height:20px;display:flex}";
const tagId$1 = "dsh-plugin-wallpapers/WallpaperDialog.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
	const tag = document.createElement("style");
	tag.dataset.plugin = "dsh-plugin-wallpapers";
	tag.dataset.pluginCss = tagId$1;
	tag.textContent = css$1;
	document.head.appendChild(tag);
}
var WallpaperDialog_module_css_default = {
	"note": "opF6ra_note",
	"sub": "opF6ra_sub",
	"audio": "opF6ra_audio",
	"badge": "opF6ra_badge",
	"thumbFallback": "opF6ra_thumbFallback",
	"kindSelected": "opF6ra_kindSelected",
	"grid": "opF6ra_grid",
	"noteError": "opF6ra_noteError",
	"cardSelected": "opF6ra_cardSelected",
	"cardUnsupported": "opF6ra_cardUnsupported",
	"toolbar": "opF6ra_toolbar",
	"search": "opF6ra_search",
	"kinds": "opF6ra_kinds",
	"gridWrap": "opF6ra_gridWrap",
	"pickerDialog": "opF6ra_pickerDialog",
	"meta": "opF6ra_meta",
	"content": "opF6ra_content",
	"name": "opF6ra_name",
	"kind": "opF6ra_kind",
	"card": "opF6ra_card",
	"thumb": "opF6ra_thumb",
	"thumbImage": "opF6ra_thumbImage"
};

//#endregion
//#region src/client/WallpaperDialog.tsx
/** Type-filter values (kind vocabulary subset that can be selected). */
const KINDS = [
	"all",
	"video",
	"web"
];
/**
* Whether one wallpaper passes the current search + type filters.
* @param wallpaper - the row under test.
* @param query - lowercased search text.
* @param kind - the active type filter.
* @returns whether the row is visible.
*/
function passes(wallpaper, query, kind) {
	if (kind !== "all" && wallpaper.kind !== kind) return false;
	if (query.length === 0) return true;
	return wallpaper.title.toLowerCase().includes(query) || wallpaper.id.toLowerCase().includes(query);
}
/**
* Render the wallpaper picker dialog.
* @param props - composed slot props.
* @returns the dialog element tree.
*/
function WallpaperDialog({ t, selectWallpaper, closeWallpaperDialog, setWallpaperMuted, useStore }) {
	const { wallpapers, selection, muted, status, error, installFound, dialogOpen } = useStore((s) => ({
		wallpapers: s.wallpapers,
		selection: s.selection,
		muted: s.muted,
		status: s.status,
		error: s.error,
		installFound: s.installFound,
		dialogOpen: s.dialogOpen
	}));
	const [query, setQuery] = (0, react.useState)("");
	const [kind, setKind] = (0, react.useState)("all");
	const lowered = query.trim().toLowerCase();
	const visible = wallpapers.filter((w) => passes(w, lowered, kind));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(__deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: dialogOpen,
		onClose: closeWallpaperDialog,
		title: t("wallpaper.dialog.title"),
		closeLabel: t("wallpaper.dialog.close"),
		className: WallpaperDialog_module_css_default.pickerDialog,
		contentClassName: WallpaperDialog_module_css_default.content,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: WallpaperDialog_module_css_default.toolbar,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "search",
					className: WallpaperDialog_module_css_default.search,
					placeholder: t("wallpaper.dialog.search"),
					value: query,
					onChange: (e) => {
						setQuery(e.target.value);
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: WallpaperDialog_module_css_default.kinds,
					children: KINDS.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx_default(WallpaperDialog_module_css_default.kind, kind === id && WallpaperDialog_module_css_default.kindSelected),
						onClick: () => {
							setKind(id);
						},
						children: t(`wallpaper.dialog.${id}`)
					}, id))
				})]
			}),
			status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperDialog_module_css_default.note,
				children: t("wallpaper.dialog.search")
			}),
			status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperDialog_module_css_default.noteError,
				children: error ?? t("wallpaper.dialog.loadError")
			}),
			status !== "error" && !installFound && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperDialog_module_css_default.note,
				children: t("wallpaper.dialog.noInstall")
			}),
			status === "ready" && installFound && visible.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperDialog_module_css_default.note,
				children: t("wallpaper.dialog.empty")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperDialog_module_css_default.gridWrap,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: WallpaperDialog_module_css_default.grid,
					children: visible.map((wallpaper) => {
						const id = `${wallpaper.collection}:${wallpaper.id}`;
						const selected = selection === id;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: clsx_default(WallpaperDialog_module_css_default.card, selected && WallpaperDialog_module_css_default.cardSelected, !wallpaper.supported && WallpaperDialog_module_css_default.cardUnsupported),
							disabled: !wallpaper.supported,
							onClick: () => {
								selectWallpaper(selected ? "" : id);
								closeWallpaperDialog();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WallpaperDialog_module_css_default.thumb,
									children: wallpaper.previewUrl !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
										className: WallpaperDialog_module_css_default.thumbImage,
										src: wallpaper.previewUrl,
										alt: "",
										loading: "lazy"
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: WallpaperDialog_module_css_default.thumbFallback,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: WallpaperDialog_module_css_default.meta,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: WallpaperDialog_module_css_default.name,
										children: wallpaper.title
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: WallpaperDialog_module_css_default.sub,
										children: [
											t(`wallpaper.dialog.collection.${wallpaper.collection}`),
											" · ",
											wallpaper.supported ? wallpaper.kind === "scene" || wallpaper.kind === "unknown" ? t("wallpaper.dialog.unsupported") : t(`wallpaper.dialog.${wallpaper.kind}`) : t("wallpaper.dialog.unsupported")
										]
									})]
								}),
								selected && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WallpaperDialog_module_css_default.badge,
									children: t("wallpaper.row.current")
								})
							]
						}, id);
					})
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: WallpaperDialog_module_css_default.audio,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: !muted,
					onChange: (e) => {
						setWallpaperMuted(!e.target.checked);
					}
				}), t("wallpaper.dialog.audio")]
			})
		]
	});
}

//#endregion
//#region \0dsh-css:D:\Github\dsh\dsh-plugin-wallpapers\src\client\WallpaperRow.module.css.mjs
const css = ".u7Zqna_group{border-bottom:.5px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}.u7Zqna_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.u7Zqna_description{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.u7Zqna_controls{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.u7Zqna_chooseButton{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);max-width:100%;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;text-overflow:ellipsis;white-space:nowrap;background:0 0;border-radius:10px;padding:6px 16px;font-size:14px;line-height:20px;overflow:hidden}.u7Zqna_chooseButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.u7Zqna_clearButton{box-sizing:border-box;font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:10px;padding:6px 12px;font-size:14px;line-height:20px}.u7Zqna_clearButton:hover{color:var(--dsw-alias-label-primary)}.u7Zqna_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}";
const tagId = "dsh-plugin-wallpapers/WallpaperRow.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
	const tag = document.createElement("style");
	tag.dataset.plugin = "dsh-plugin-wallpapers";
	tag.dataset.pluginCss = tagId;
	tag.textContent = css;
	document.head.appendChild(tag);
}
var WallpaperRow_module_css_default = {
	"description": "u7Zqna_description",
	"group": "u7Zqna_group",
	"controls": "u7Zqna_controls",
	"chooseButton": "u7Zqna_chooseButton",
	"clearButton": "u7Zqna_clearButton",
	"error": "u7Zqna_error",
	"title": "u7Zqna_title"
};

//#endregion
//#region src/client/WallpaperRow.tsx
/**
* Render the Wallpaper row.
* @param props - composed slot props.
* @returns the row element tree.
*/
function WallpaperRow({ t, openWallpaperDialog, useStore }) {
	const { selectedTitle, status } = useStore((s) => ({
		selectedTitle: s.selectedTitle,
		status: s.status
	}));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: WallpaperRow_module_css_default.group,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperRow_module_css_default.title,
				children: t("wallpaper.row.title")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WallpaperRow_module_css_default.description,
				children: t("wallpaper.row.description")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: WallpaperRow_module_css_default.controls,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: WallpaperRow_module_css_default.chooseButton,
					onClick: openWallpaperDialog,
					children: selectedTitle === null ? t("wallpaper.row.choose") : selectedTitle
				}), status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: WallpaperRow_module_css_default.error,
					children: t("wallpaper.dialog.loadError")
				})]
			})
		]
	});
}

//#endregion
//#region src/client/locales.ts
/** `ui-wallpaper` namespace dictionaries (the picker row and dialog's copy). */
/** Simplified Chinese dictionary (the key-set source of truth). */
const zh = {
	"wallpaper.row.title": "壁纸",
	"wallpaper.row.description": "用 Wallpaper Engine 的壁纸装点 dsh 的背景（不会改变桌面壁纸）",
	"wallpaper.row.current": "当前壁纸",
	"wallpaper.row.none": "未选择",
	"wallpaper.row.choose": "选择壁纸",
	"wallpaper.row.clear": "清除",
	"wallpaper.dialog.title": "选择壁纸",
	"wallpaper.dialog.close": "关闭",
	"wallpaper.dialog.search": "搜索壁纸…",
	"wallpaper.dialog.all": "全部",
	"wallpaper.dialog.video": "视频",
	"wallpaper.dialog.web": "网页",
	"wallpaper.dialog.unsupported": "不支持",
	"wallpaper.dialog.empty": "没有找到壁纸",
	"wallpaper.dialog.noInstall": "未找到 Wallpaper Engine 安装。请确认 Steam 库位置已正确配置。",
	"wallpaper.dialog.loadError": "读取壁纸列表失败",
	"wallpaper.dialog.retry": "重试",
	"wallpaper.dialog.audio": "播放声音",
	"wallpaper.dialog.collection.workshop": "创意工坊",
	"wallpaper.dialog.collection.bundled": "内置"
};
/** English dictionary, checked complete against the zh key set. */
const en = {
	"wallpaper.row.title": "Wallpaper",
	"wallpaper.row.description": "Dress dsh's own background with Wallpaper Engine wallpapers (the desktop wallpaper is untouched)",
	"wallpaper.row.current": "Current wallpaper",
	"wallpaper.row.none": "None",
	"wallpaper.row.choose": "Choose wallpaper",
	"wallpaper.row.clear": "Clear",
	"wallpaper.dialog.title": "Choose a wallpaper",
	"wallpaper.dialog.close": "Close",
	"wallpaper.dialog.search": "Search wallpapers…",
	"wallpaper.dialog.all": "All",
	"wallpaper.dialog.video": "Video",
	"wallpaper.dialog.web": "Web",
	"wallpaper.dialog.unsupported": "Unsupported",
	"wallpaper.dialog.empty": "No wallpapers found",
	"wallpaper.dialog.noInstall": "No Wallpaper Engine installation found. Check that the configured Steam library locations are correct.",
	"wallpaper.dialog.loadError": "Failed to load the wallpaper list",
	"wallpaper.dialog.retry": "Retry",
	"wallpaper.dialog.audio": "Play sound",
	"wallpaper.dialog.collection.workshop": "Workshop",
	"wallpaper.dialog.collection.bundled": "Bundled"
};

//#endregion
//#region src/wallpaper-settings.ts
/** Wallpaper preferences stored in the Host user-settings document. */
/** Settings namespace owned by the wallpaper plugin. */
const WALLPAPER_SETTINGS_NAMESPACE = "ui-wallpaper";
/**
* Split one stored selection value into its collection and id halves.
* @param selection - the stored `<collection>:<id>` value.
* @returns the pair, or undefined when the value is empty or malformed.
*/
function parseSelection(selection) {
	if (selection.length === 0) return void 0;
	const at = selection.indexOf(":");
	if (at <= 0 || at === selection.length - 1) return void 0;
	const collection = selection.slice(0, at);
	return collection === "workshop" || collection === "bundled" ? {
		collection,
		id: selection.slice(at + 1)
	} : void 0;
}

//#endregion
//#region src/client/picker-store.ts
/** The empty roster a deployment without the wallpapers service answers. */
const EMPTY_ROSTER = {
	wallpapers: [],
	steamRootsFound: false,
	installFound: false
};
/** Host-face mirror of the channel constant (`@deepseek-ai/dsh-host-wallpapers` is type-only here). */
const WALLPAPERS_RPC_CHANNEL = "/wallpapers-roster";
/**
* Read the roster over the self-mounted `/wallpapers-roster` channel, turning
* a refusal into the message every surface shows.
* @param ctx - the browser plugin context carrying the connection service.
* @returns the roster, or the message to show in its place.
*/
async function readRoster(ctx) {
	try {
		const result = await ctx.connection.rpc.call(WALLPAPERS_RPC_CHANNEL, "list", {});
		if (result.ok) return {
			ok: true,
			value: result.value
		};
		return {
			ok: false,
			error: result.error.message
		};
	} catch {
		return {
			ok: true,
			value: EMPTY_ROSTER
		};
	}
}
/**
* Declares the picker state and write surface; the plugin's apply world is
* the only writer.
* @returns the store handle.
*/
function createWallpaperPickerStore() {
	return (0, __deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			status: "idle",
			error: null,
			wallpapers: EMPTY_ROSTER.wallpapers,
			steamRootsFound: false,
			installFound: false,
			selection: "",
			muted: true,
			selectedTitle: null,
			dialogOpen: false
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
			dialog: (d, open) => {
				d.dialogOpen = open;
			}
		}
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
	if (parsed === void 0) return null;
	return wallpapers.find((w) => w.collection === parsed.collection && w.id === parsed.id)?.title ?? null;
}
/**
* Read the durable section off a settings-scope snapshot.
* @param value - the scope document's value, when the document has one.
* @returns the section fields with schema defaults filled in.
*/
function readSettings(value) {
	const section = value ?? {};
	return {
		selection: typeof section.selection === "string" ? section.selection : "",
		muted: typeof section.muted === "boolean" ? section.muted : true
	};
}
/**
* Persist one selection through the settings scope. The value is the
* `<collection>:<id>` wire form, or the empty string for none.
* @param scope - the bound ui-wallpaper settings scope.
* @param selection - the value to write.
*/
async function writeSelection(scope, selection) {
	await scope.set("selection", selection);
}
/**
* Persist the mute preference through the settings scope.
* @param scope - the bound ui-wallpaper settings scope.
* @param muted - the value to write.
*/
async function writeMuted(scope, muted) {
	await scope.set("muted", muted);
}

//#endregion
//#region \0dsh-inline-css:D:\Github\dsh\dsh-plugin-wallpapers\src\client\wallpaper-layer.css.mjs
var wallpaper_layer_css_default = "[data-dsw-wallpaper-layer]{z-index:-1;pointer-events:none;background:var(--dsw-alias-bg-base);position:fixed;inset:0;overflow:hidden}[data-dsw-wallpaper-layer]>video,[data-dsw-wallpaper-layer]>iframe{object-fit:cover;border:none;width:100%;height:100%;display:block}";

//#endregion
//#region src/client/wallpaper-layer.ts
/** How long a web wallpaper's iframe gets to fire its load event (ms). */
const WEB_LOAD_TIMEOUT_MS = 15e3;
/**
* Apply the translucent-theme override: the app's base background and the
* sidebar fill give way to the wallpaper while it plays, and retract when it
* stops. Both modes get the same value — the wallpaper shows through either
* scheme.
*
* Surfaces that would otherwise block or clash with the wallpaper become
* translucent glass sheets tinted from the scheme's own ink (light: white
* veils, dark: dark veils) rather than solid fills:
* - the sidebar column (`sidebar-fill`) and the chat composer card
*   (`input-major`) — the biggest blockers over the wallpaper,
* - the user message bubble (`bubble`),
* - settings panel and Modal cards (`bg-layer-2`) and dropdown menus
*   (`bg-layer-3` / `menu`), which keep their hairline strokes and shadows
*   for separation.
* Rebinds derived aliases (`menu` reads layer-3) to the same glass so the
* rebind doesn't resurrect an opaque fill underneath.
*/
const TRANSLUCENT_TOKENS = {
	"--dsw-alias-bg-base": {
		light: "transparent",
		dark: "transparent"
	},
	"--dsw-specific-sidebar-fill": {
		light: "rgba(255, 255, 255, 0.55)",
		dark: "rgba(30, 30, 34, 0.55)"
	},
	"--dsw-specific-input-major": {
		light: "rgba(255, 255, 255, 0.55)",
		dark: "rgba(30, 30, 34, 0.55)"
	},
	"--dsw-specific-bubble": {
		light: "rgba(255, 255, 255, 0.6)",
		dark: "rgba(30, 30, 34, 0.6)"
	},
	"--dsw-alias-bg-layer-2": {
		light: "rgba(255, 255, 255, 0.82)",
		dark: "rgba(30, 30, 34, 0.82)"
	},
	"--dsw-alias-bg-layer-3": {
		light: "rgba(255, 255, 255, 0.92)",
		dark: "rgba(30, 30, 34, 0.92)"
	},
	"--dsw-specific-menu": {
		light: "rgba(255, 255, 255, 0.92)",
		dark: "rgba(30, 30, 34, 0.92)"
	}
};
/**
* Mount the background layer for one selected wallpaper.
* @param summary - the selected wallpaper's roster row.
* @param muted - whether the layer's audio starts muted.
* @returns disposer removing the layer element.
*/
function mountWallpaperLayer(summary, muted) {
	if (typeof document === "undefined") return () => {};
	const layer = document.createElement("div");
	layer.dataset.dswWallpaperLayer = "";
	layer.setAttribute("aria-hidden", "true");
	let media;
	if (summary.kind === "video" && summary.entryUrl !== null) {
		const video = document.createElement("video");
		video.src = summary.entryUrl;
		video.muted = muted;
		video.loop = true;
		video.autoplay = true;
		video.playsInline = true;
		video.disablePictureInPicture = true;
		media = video;
	} else if (summary.kind === "web" && summary.entryUrl !== null) {
		const frame = document.createElement("iframe");
		frame.src = summary.entryUrl;
		frame.style.pointerEvents = "none";
		frame.setAttribute("title", "");
		frame.setAttribute("tabindex", "-1");
		media = frame;
		const timer = setTimeout(() => {
			frame.src = "";
		}, WEB_LOAD_TIMEOUT_MS);
		frame.addEventListener("load", () => {
			clearTimeout(timer);
		}, { once: true });
	}
	if (media === void 0) return () => {};
	layer.appendChild(media);
	document.body.appendChild(layer);
	if (media instanceof HTMLVideoElement) media.play().catch(() => {});
	return () => {
		layer.remove();
	};
}

//#endregion
//#region src/client/index.ts
/** Mount the stage stylesheet for the plugin lifetime. */
function installLayerStyles(ctx) {
	if (typeof document === "undefined") return;
	ctx.effect(() => {
		const tag = document.createElement("style");
		tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-wallpaper";
		tag.textContent = wallpaper_layer_css_default;
		document.head.appendChild(tag);
		return () => {
			tag.remove();
		};
	}, "ui-wallpaper: layer stylesheet");
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
const inject = [
	"slots",
	"locale",
	"remote",
	"connection",
	"settingsScope",
	"theme"
];
/**
* Client plugin body: bind the settings scope, run the stage controller,
* register the localized row and dialog.
* @param ctx - client cordis context.
*/
function apply(ctx) {
	installLayerStyles(ctx);
	const host = ctx.settingsScope.bind({ namespace: WALLPAPER_SETTINGS_NAMESPACE });
	const store = createWallpaperPickerStore();
	let bound;
	/** The live roster (empty until the first read lands). */
	let roster = {
		wallpapers: [],
		steamRootsFound: false,
		installFound: false
	};
	/** Resolve the summary one stored selection names, from the live roster. */
	const resolve = (selection) => {
		const parsed = parseSelection(selection);
		if (parsed === void 0) return void 0;
		return roster.wallpapers.find((w) => w.collection === parsed.collection && w.id === parsed.id);
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
		const url = summary?.entryUrl ?? void 0;
		const muted = section.muted;
		if (url === mountedUrl && muted === mountedMuted) return;
		layerDispose?.();
		overrideDispose?.();
		layerDispose = void 0;
		overrideDispose = void 0;
		mountedUrl = url;
		mountedMuted = muted;
		if (summary === void 0 || summary.entryUrl === null) return;
		layerDispose = mountWallpaperLayer(summary, muted);
		overrideDispose = ctx.theme.overrideTokens("ui-wallpaper", { ...TRANSLUCENT_TOKENS });
	};
	ctx.effect(() => () => {
		layerDispose?.();
		overrideDispose?.();
	}, "ui-wallpaper: stage teardown");
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
	ctx.effect(() => host.subscribe(() => {
		push("ready", null);
	}), "ui-wallpaper: settings scope adoption");
	let readToken = 0;
	const refresh = async () => {
		const token = ++readToken;
		const rosterRead = await readRoster({ connection: ctx.get("connection") });
		if (token !== readToken) return;
		if (rosterRead.ok) roster = rosterRead.value;
		push(rosterRead.ok ? "ready" : "error", rosterRead.ok ? null : rosterRead.error);
	};
	refresh();
	ctx.effect(() => ctx.locale.register("ui-wallpaper", {
		zh,
		en
	}), "ui-wallpaper: dictionaries");
	ctx.slots.inject("settings.general.item", () => ctx.slots.register({
		name: "settings.general.item",
		id: "wallpaper",
		order: 12,
		store,
		locale: "ui-wallpaper",
		inject: (actions) => {
			bound = actions;
			return { openWallpaperDialog: () => {
				actions.dialog(true);
				refresh();
			} };
		}
	}, WallpaperRow));
	ctx.slots.inject("settings.general.item", () => ctx.slots.register({
		name: "settings.general.item",
		id: "wallpaper-dialog",
		order: 13,
		store,
		locale: "ui-wallpaper",
		inject: (actions) => {
			bound = actions;
			return {
				selectWallpaper: (selection) => {
					writeSelection(host, selection);
					bound?.sync("ready", null, roster, selection, readSettings(host.getSnapshot().value).muted);
				},
				closeWallpaperDialog: () => {
					actions.dialog(false);
				},
				setWallpaperMuted: (muted) => {
					writeMuted(host, muted);
					bound?.sync("ready", null, roster, readSettings(host.getSnapshot().value).selection, muted);
				}
			};
		}
	}, WallpaperDialog));
}

//#endregion
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=client.js.map