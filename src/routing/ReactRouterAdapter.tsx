import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useHref, useLocation, useNavigate } from "react-router-dom";
import { RouterProvider, type Router } from "./router";

/** Lets the components navigate with React Router. For the demo app and Storybook. */
export function ReactRouterAdapter({ children }: { children: ReactNode }) {
  // React Router makes a new navigate on every path change. Keep the latest in
  // a ref so the router object, and everything that reads it, stays put.
  const navigate = useNavigate();
  const latest = useRef(navigate);
  useLayoutEffect(() => {
    latest.current = navigate;
  });
  const router = useMemo<Router>(
    () => ({ navigate: (to, opts) => void latest.current(to, opts), useHref, useLocation }),
    []
  );
  return <RouterProvider value={router}>{children}</RouterProvider>;
}
