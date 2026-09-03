import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Wallpaper picker dialog: the Modal over the roster store. Roster rows list
 * bundled and Workshop wallpapers; the search field narrows by title and id,
 * the type filter toggles video/web visibility, unsupported kinds (scene,
 * unknown) render greyed and unselectable, and the current selection is
 * marked. Selecting writes through the injected face; the dialog owns no
 * state of its own beyond its open gate.
 */
import { useState } from 'react';
import clsx from 'clsx';
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './WallpaperDialog.module.css';
/** Type-filter values (kind vocabulary subset that can be selected). */
const KINDS = ['all', 'video', 'web'];
/**
 * Whether one wallpaper passes the current search + type filters.
 * @param wallpaper - the row under test.
 * @param query - lowercased search text.
 * @param kind - the active type filter.
 * @returns whether the row is visible.
 */
function passes(wallpaper, query, kind) {
    if (kind !== 'all' && wallpaper.kind !== kind)
        return false;
    if (query.length === 0)
        return true;
    return wallpaper.title.toLowerCase().includes(query) || wallpaper.id.toLowerCase().includes(query);
}
/**
 * Render the wallpaper picker dialog.
 * @param props - composed slot props.
 * @returns the dialog element tree.
 */
export function WallpaperDialog({ t, selectWallpaper, closeWallpaperDialog, setWallpaperMuted, useStore }) {
    const { wallpapers, selection, muted, status, error, installFound, dialogOpen } = useStore(s => ({
        wallpapers: s.wallpapers,
        selection: s.selection,
        muted: s.muted,
        status: s.status,
        error: s.error,
        installFound: s.installFound,
        dialogOpen: s.dialogOpen,
    }));
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState('all');
    const lowered = query.trim().toLowerCase();
    const visible = wallpapers.filter(w => passes(w, lowered, kind));
    return (_jsxs(Modal, { open: dialogOpen, onClose: closeWallpaperDialog, title: t('wallpaper.dialog.title'), closeLabel: t('wallpaper.dialog.close'), className: css.pickerDialog, contentClassName: css.content, children: [_jsxs("div", { className: css.toolbar, children: [_jsx("input", { type: "search", className: css.search, placeholder: t('wallpaper.dialog.search'), value: query, onChange: (e) => { setQuery(e.target.value); } }), _jsx("div", { className: css.kinds, children: KINDS.map(id => (_jsx("button", { type: "button", className: clsx(css.kind, kind === id && css.kindSelected), onClick: () => { setKind(id); }, children: t(`wallpaper.dialog.${id}`) }, id))) })] }), status === 'loading' && _jsx("div", { className: css.note, children: t('wallpaper.dialog.search') }), status === 'error' && (_jsx("div", { className: css.noteError, children: error ?? t('wallpaper.dialog.loadError') })), status !== 'error' && !installFound && (_jsx("div", { className: css.note, children: t('wallpaper.dialog.noInstall') })), status === 'ready' && installFound && visible.length === 0 && (_jsx("div", { className: css.note, children: t('wallpaper.dialog.empty') })), _jsx("div", { className: css.gridWrap, children: _jsx("div", { className: css.grid, children: visible.map((wallpaper) => {
                        const id = `${wallpaper.collection}:${wallpaper.id}`;
                        const selected = selection === id;
                        return (_jsxs("button", { type: "button", className: clsx(css.card, selected && css.cardSelected, !wallpaper.supported && css.cardUnsupported), disabled: !wallpaper.supported, onClick: () => { selectWallpaper(selected ? '' : id); closeWallpaperDialog(); }, children: [_jsx("span", { className: css.thumb, children: wallpaper.previewUrl !== null
                                        ? _jsx("img", { className: css.thumbImage, src: wallpaper.previewUrl, alt: "", loading: "lazy" })
                                        : _jsx("span", { className: css.thumbFallback, "aria-hidden": "true" }) }), _jsxs("span", { className: css.meta, children: [_jsx("span", { className: css.name, children: wallpaper.title }), _jsxs("span", { className: css.sub, children: [t(`wallpaper.dialog.collection.${wallpaper.collection}`), ' · ', wallpaper.supported
                                                    ? wallpaper.kind === 'scene' || wallpaper.kind === 'unknown'
                                                        ? t('wallpaper.dialog.unsupported')
                                                        : t(`wallpaper.dialog.${wallpaper.kind}`)
                                                    : t('wallpaper.dialog.unsupported')] })] }), selected && _jsx("span", { className: css.badge, children: t('wallpaper.row.current') })] }, id));
                    }) }) }), _jsxs("label", { className: css.audio, children: [_jsx("input", { type: "checkbox", checked: !muted, onChange: (e) => { setWallpaperMuted(!e.target.checked); } }), t('wallpaper.dialog.audio')] })] }));
}
