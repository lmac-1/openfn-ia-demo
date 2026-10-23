import { useCallback, useMemo } from "react";
import { useRouter } from "../routing/router";

/** Query params to set (a string) or remove (`null`); others are left alone. */
export type ParamPatch = Record<string, string | null>;

/**
 * The URL's query params as a plain object, and `update(patch)` to set or
 * remove some of them without touching the rest. `href(patch)` is the URL
 * `update` would go to, for a link: the current path, so a page that links
 * through it knows no routes. Both copy the current params rather than
 * mutating them. Name the keys a page reads (`useUrlParams<"job" | "run">()`)
 * to write `params.job`.
 */
export function useUrlParams<K extends string = string>() {
  const { navigate, useLocation } = useRouter();
  const { pathname, search, hash } = useLocation();
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)) as Partial<Record<K, string>>, [search]);
  const href = useCallback(
    (patch: ParamPatch) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      const query = String(next);
      return `${pathname}${query && `?${query}`}`;
    },
    [pathname, search]
  );
  const update = useCallback((patch: ParamPatch) => navigate(`${href(patch)}${hash}`), [navigate, href, hash]);
  return { params, update, href };
}
