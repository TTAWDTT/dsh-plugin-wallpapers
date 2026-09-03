/**
 * Wallpaper preference row registered into the General section item slot:
 * current selection + Choose (opens the picker dialog) + Clear.
 */
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createWallpaperPickerStore } from './picker-store.ts';
/** Injected business face: open the picker dialog (clear rides select('')). */
export interface WallpaperRowInjected {
    /** Open the picker dialog. */
    openWallpaperDialog: () => void;
}
/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperRowComponentProps = PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperPickerStore>> & PropsLocale<'ui-wallpaper'> & WallpaperRowInjected;
/**
 * Render the Wallpaper row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export declare function WallpaperRow({ t, openWallpaperDialog, useStore }: WallpaperRowComponentProps): import("react").JSX.Element;
