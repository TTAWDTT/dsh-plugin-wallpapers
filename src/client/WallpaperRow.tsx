/**
 * Wallpaper preference row registered into the General section item slot:
 * current selection + Choose (opens the picker dialog) + Clear.
 */
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createWallpaperPickerStore } from './picker-store.ts'
import css from './WallpaperRow.module.css'

/** Injected business face: open the picker dialog (clear rides select('')). */
export interface WallpaperRowInjected {
  /** Open the picker dialog. */
  openWallpaperDialog: () => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperPickerStore>>
  & PropsLocale<'ui-wallpaper'> & WallpaperRowInjected

/**
 * Render the Wallpaper row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function WallpaperRow({ t, openWallpaperDialog, useStore }: WallpaperRowComponentProps) {
  const { selectedTitle, status } = useStore(s => ({ selectedTitle: s.selectedTitle, status: s.status }))
  return (
    <div className={css.group}>
      <div className={css.title}>{t('wallpaper.row.title')}</div>
      <div className={css.description}>{t('wallpaper.row.description')}</div>
      <div className={css.controls}>
        <button type="button" className={css.chooseButton} onClick={openWallpaperDialog}>
          {selectedTitle === null ? t('wallpaper.row.choose') : selectedTitle}
        </button>
        {status === 'error' && <span className={css.error}>{t('wallpaper.dialog.loadError')}</span>}
      </div>
    </div>
  )
}
