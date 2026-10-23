/* eslint-disable react-refresh/only-export-components -- the provider and its hook belong beside the Link that uses them */
import { createContext, useContext, useMemo, useSyncExternalStore, type AnchorHTMLAttributes, type Ref } from "react";

export interface NavigateOptions {
  replace?: boolean;
}

/**
 * How the host app navigates. Components never import a router: they call
 * `useRouter()` and the app root provides one with `RouterProvider`. The
 * `use*` members are hooks, so call them unconditionally.
 */
export interface Router {
  /** `to` is an absolute path, a `#hash` or a `?query`. */
  navigate(to: string, opts?: NavigateOptions): void;
  /** The href to render for an in-app path, e.g. `#/projects` under a hash router. */
  useHref(to: string): string;
  useLocation(): { pathname: string; search: string; hash: string };
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const go = (to: string, opts?: NavigateOptions) =>
  opts?.replace ? window.location.replace(to) : window.location.assign(to);

// One URL object per href, so results stay stable between renders.
const useUrl = () => {
  const href = useSyncExternalStore(subscribe, () => window.location.href);
  return useMemo(() => new URL(href), [href]);
};

/** The default with no provider: plain anchors and full page loads. */
const browserRouter: Router = {
  navigate: go,
  useHref: (to) => to,
  useLocation: useUrl,
};

const RouterContext = createContext<Router>(browserRouter);

export const RouterProvider = RouterContext.Provider;

export const useRouter = () => useContext(RouterContext);

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** An in-app path. Use a plain `<a href>` for external links. */
  to: string;
  ref?: Ref<HTMLAnchorElement>;
};

/**
 * An `<a href>` that navigates through the router on a plain left click.
 * New-tab clicks, `target`, `download` and a handler's `preventDefault()`
 * fall through to the browser. A link to the current URL replaces the history
 * entry, as React Router's Link does, so Back doesn't stall.
 */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const { navigate, useHref, useLocation } = useRouter();
  const href = useHref(to);
  const { pathname, search, hash } = useLocation();
  const here = `${pathname}${search}${hash}`;
  const target = new URL(to, `http://x${here}`);
  const replace = `${target.pathname}${target.search}${target.hash}` === here;
  return (
    <a
      {...rest}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if ((rest.target && rest.target !== "_self") || rest.download !== undefined) return;
        e.preventDefault();
        navigate(to, { replace });
      }}
    />
  );
}
