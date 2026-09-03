import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createWallpaperPickerStore } from './picker-store.ts';
/** Injected business face: select one wallpaper, close the dialog, toggle mute. */
export interface WallpaperDialogInjected {
    /** Select one wallpaper (or clear with the empty value). */
    selectWallpaper: (selection: string) => void;
    /** Close the dialog without changing anything. */
    closeWallpaperDialog: () => void;
    /** Toggle the mute preference. */
    setWallpaperMuted: (muted: boolean) => void;
}
/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperDialogComponentProps = PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperPickerStore>> & PropsLocale<'ui-wallpaper'> & WallpaperDialogInjected;
/**
 * Render the wallpaper picker dialog.
 * @param props - composed slot props.
 * @returns the dialog element tree.
 */
export declare function WallpaperDialog({ t, selectWallpaper, closeWallpaperDialog, setWallpaperMuted, useStore }: WallpaperDialogComponentProps): import("react").JSX.Element;
