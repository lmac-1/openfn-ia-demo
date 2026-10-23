import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import UserMenu from "./UserMenu";

// Headless UI's menus watch their trigger's size; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("UserMenu", () => {
  it("makes the experimental notice's link a menu item, so the menu closes and the keyboard reaches it", () => {
    const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/projects", search: "", hash: "" }) };
    render(
      <RouterProvider value={router}>
        <UserMenu user={{ firstName: "Amy", lastName: "Admin", email: "amy@example.org", experimentalFeatures: true }} />
      </RouterProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /Amy Admin/ }));
    const link = screen.getByRole("menuitem", { name: "Turn off in your profile" });
    // Focus stays on the menu, so the active item needs its own ring.
    expect(link.className).toContain("data-focus:outline-primary-600");
    fireEvent.click(link);
    expect(router.navigate).toHaveBeenCalledWith("/profile", { replace: false });
  });
});
