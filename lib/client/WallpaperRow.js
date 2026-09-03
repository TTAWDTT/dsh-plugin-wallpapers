import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './WallpaperRow.module.css';
/**
 * Render the Wallpaper row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperRow({ t, openWallpaperDialog, useStore }) {
    const { selectedTitle, status } = useStore(s => ({ selectedTitle: s.selectedTitle, status: s.status }));
    return (_jsxs("div", { className: css.group, children: [_jsx("div", { className: css.title, children: t('wallpaper.row.title') }), _jsx("div", { className: css.description, children: t('wallpaper.row.description') }), _jsxs("div", { className: css.controls, children: [_jsx("button", { type: "button", className: css.chooseButton, onClick: openWallpaperDialog, children: selectedTitle === null ? t('wallpaper.row.choose') : selectedTitle }), status === 'error' && _jsx("span", { className: css.error, children: t('wallpaper.dialog.loadError') })] })] }));
}
