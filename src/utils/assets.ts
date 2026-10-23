/**
 * Where the app's static images live. The replica sets this from Vite's
 * base path in main.tsx; a host that serves images at the root, such as
 * Lightning, leaves the default. Components must not read import.meta.env:
 * it only exists under Vite.
 */
let base = "/";

export function setAssetBase(url: string) {
  base = url.endsWith("/") ? url : `${url}/`;
}

/** The URL of a file under the app's images folder, e.g. `images/logo.svg`. */
export function assetUrl(path: string): string {
  return `${base}${path.replace(/^\//, "")}`;
}
