import { vi } from "vitest";

// Monaco doesn't run in jsdom; every test gets the plain-text stand-in.
vi.mock("@monaco-editor/react", () => import("./monaco"));

// Headless UI's menus and Radix's tooltips watch their trigger's size; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
