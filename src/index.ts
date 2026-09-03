/**
 * Node-half entry: the wallpapers host service (Wallpaper Engine discovery,
 * the `/wallpapers` media routes, and the `/wallpapers-roster` RPC channel).
 * The `exports` map pins `.` here; the implementation lives in
 * `./host/index.ts`, and the client bundle is emitted beside it at
 * `lib/client.js` by tsdown (see tsdown.config.ts).
 * @module dsh-plugin-wallpapers
 */

export * from './host/index.ts'
export { Wallpapers as default } from './host/index.ts'
