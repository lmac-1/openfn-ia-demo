import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../routing/router";
import { Th } from "./Table";

describe("Th", () => {
  it("links a server-sorted header through the router", () => {
    const router: Router = {
      navigate: vi.fn(),
      useHref: (to) => "#" + to,
      useLocation: () => ({ pathname: "/projects/p1/w", search: "", hash: "" }),
    };
    render(
      <RouterProvider value={router}>
        <table>
          <thead>
            <tr>
              <Th sortHref="/projects/p1/w?sort=name&dir=asc" sortDirection={null}>
                Name
              </Th>
            </tr>
          </thead>
        </table>
      </RouterProvider>
    );
    const link = screen.getByRole("link", { name: /Name/ });
    expect(link.getAttribute("href")).toBe("#/projects/p1/w?sort=name&dir=asc");
    fireEvent.click(link);
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/w?sort=name&dir=asc", { replace: false });
  });
});
