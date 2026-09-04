// @vitest-environment jsdom
/** WallpaperLayer sandbox: workshop web wallpapers run in an opaque-origin
 * iframe — the two tokens `allow-scripts allow-same-origin` would hand the
 * frame its full origin privileges back (parent DOM, cookies, credentialed
 * /api calls), so the attribute must carry `allow-scripts` alone. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWallpaperLayer } from '../src/client/wallpaper-layer.ts'
import type { WallpaperSummary } from '../src/host/types.ts'

// jsdom's HTMLMediaElement carries no play(); the layer fires it on mount.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
})

afterEach(() => {
  document.querySelectorAll('[data-dsw-wallpaper-layer]').forEach(layer => layer.remove())
  vi.restoreAllMocks()
})

/** A supported web wallpaper row (the sandbox-relevant one). */
function webSummary(): WallpaperSummary {
  return {
    id: '311111', collection: 'workshop', title: 'W', kind: 'web', supported: true,
    previewUrl: '/wallpapers/workshop/311111/preview.gif', entryUrl: '/wallpapers/workshop/311111/index.html',
    properties: [], contentRating: null,
  }
}

describe('mountWallpaperLayer web sandbox', () => {
  it('sandboxes web wallpapers to opaque-origin scripts', () => {
    const dispose = mountWallpaperLayer(webSummary(), true)
    const frame = document.querySelector('iframe')
    expect(frame).not.toBeNull()
    expect(frame!.getAttribute('sandbox')).toBe('allow-scripts')
    expect(frame!.style.pointerEvents).toBe('none')
    dispose()
    expect(document.querySelector('iframe')).toBeNull()
  })
})
