/**
 * Wallpaper picker dialog: the Modal over the roster store. Roster rows list
 * bundled and Workshop wallpapers; the search field narrows by title and id,
 * the type filter toggles video/web visibility, unsupported kinds (scene,
 * unknown) render greyed and unselectable, and the current selection is
 * marked. Selecting writes through the injected face; the dialog owns no
 * state of its own beyond its open gate.
 */
import { useState } from 'react'
import clsx from 'clsx'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { WallpaperSummary } from '../host/types.ts'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createWallpaperPickerStore } from './picker-store.ts'
import css from './WallpaperDialog.module.css'

/** Injected business face: select one wallpaper, close the dialog, toggle mute. */
export interface WallpaperDialogInjected {
  /** Select one wallpaper (or clear with the empty value). */
  selectWallpaper: (selection: string) => void
  /** Close the dialog without changing anything. */
  closeWallpaperDialog: () => void
  /** Toggle the mute preference. */
  setWallpaperMuted: (muted: boolean) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type WallpaperDialogComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createWallpaperPickerStore>>
  & PropsLocale<'ui-wallpaper'> & WallpaperDialogInjected

/** Type-filter values (kind vocabulary subset that can be selected). */
const KINDS = ['all', 'video', 'web'] as const
type KindFilter = typeof KINDS[number]

/**
 * Whether one wallpaper passes the current search + type filters.
 * @param wallpaper - the row under test.
 * @param query - lowercased search text.
 * @param kind - the active type filter.
 * @returns whether the row is visible.
 */
function passes(wallpaper: WallpaperSummary, query: string, kind: KindFilter): boolean {
  if (kind !== 'all' && wallpaper.kind !== kind) return false
  if (query.length === 0) return true
  return wallpaper.title.toLowerCase().includes(query) || wallpaper.id.toLowerCase().includes(query)
}

/**
 * Render the wallpaper picker dialog.
 * @param props - composed slot props.
 * @returns the dialog element tree.
 */
export function WallpaperDialog(
  { t, selectWallpaper, closeWallpaperDialog, setWallpaperMuted, useStore }: WallpaperDialogComponentProps,
) {
  const { wallpapers, selection, muted, status, error, installFound, dialogOpen } = useStore(
    s => ({
      wallpapers: s.wallpapers,
      selection: s.selection,
      muted: s.muted,
      status: s.status,
      error: s.error,
      installFound: s.installFound,
      dialogOpen: s.dialogOpen,
    }),
  )
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<KindFilter>('all')
  const lowered = query.trim().toLowerCase()
  const visible = wallpapers.filter(w => passes(w, lowered, kind))
  return (
    <Modal
      open={dialogOpen}
      onClose={closeWallpaperDialog}
      title={t('wallpaper.dialog.title')}
      closeLabel={t('wallpaper.dialog.close')}
      className={css.pickerDialog as string}
      contentClassName={css.content as string}
    >
      <div className={css.toolbar}>
        <input
          type="search"
          className={css.search}
          placeholder={t('wallpaper.dialog.search')}
          value={query}
          onChange={(e) => { setQuery(e.target.value) }}
        />
        <div className={css.kinds}>
          {KINDS.map(id => (
            <button
              key={id}
              type="button"
              className={clsx(css.kind, kind === id && css.kindSelected)}
              onClick={() => { setKind(id) }}
            >
              {t(`wallpaper.dialog.${id}`)}
            </button>
          ))}
        </div>
      </div>
      {status === 'loading' && <div className={css.note}>{t('wallpaper.dialog.search')}</div>}
      {status === 'error' && (
        <div className={css.noteError}>{error ?? t('wallpaper.dialog.loadError')}</div>
      )}
      {status !== 'error' && !installFound && (
        <div className={css.note}>{t('wallpaper.dialog.noInstall')}</div>
      )}
      {status === 'ready' && installFound && visible.length === 0 && (
        <div className={css.note}>{t('wallpaper.dialog.empty')}</div>
      )}
      <div className={css.gridWrap}>
        <div className={css.grid}>
        {visible.map((wallpaper) => {
          const id = `${wallpaper.collection}:${wallpaper.id}`
          const selected = selection === id
          return (
            <button
              key={id}
              type="button"
              className={clsx(css.card, selected && css.cardSelected, !wallpaper.supported && css.cardUnsupported)}
              disabled={!wallpaper.supported}
              onClick={() => { selectWallpaper(selected ? '' : id); closeWallpaperDialog() }}
            >
              <span className={css.thumb}>
                {wallpaper.previewUrl !== null
                  ? <img className={css.thumbImage} src={wallpaper.previewUrl} alt="" loading="lazy" />
                  : <span className={css.thumbFallback} aria-hidden="true" />}
              </span>
              <span className={css.meta}>
                <span className={css.name}>{wallpaper.title}</span>
                <span className={css.sub}>
                  {t(`wallpaper.dialog.collection.${wallpaper.collection}`)}
                  {' · '}
                  {wallpaper.supported
                    ? wallpaper.kind === 'scene' || wallpaper.kind === 'unknown'
                      ? t('wallpaper.dialog.unsupported')
                      : t(`wallpaper.dialog.${wallpaper.kind}`)
                    : t('wallpaper.dialog.unsupported')}
                </span>
              </span>
              {selected && <span className={css.badge}>{t('wallpaper.row.current')}</span>}
            </button>
          )
        })}
        </div>
      </div>
      <label className={css.audio}>
        <input
          type="checkbox"
          checked={!muted}
          onChange={(e) => { setWallpaperMuted(!e.target.checked) }}
        />
        {t('wallpaper.dialog.audio')}
      </label>
    </Modal>
  )
}
