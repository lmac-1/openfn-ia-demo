import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import AdminAuditPageReplica from "./AdminAuditPage.replica";

function renderAt(search: string) {
  const router: Router = {
    navigate: vi.fn(),
    useHref: (to) => to,
    useLocation: () => ({ pathname: "/settings/audit", search, hash: "" }),
  };
  render(
    <RouterProvider value={router}>
      <AdminAuditPageReplica />
    </RouterProvider>
  );
  return router;
}

const summary = () => screen.getByText((_, el) => el?.tagName === "P" && /^Showing/.test(el.textContent ?? "")).textContent;

describe("AdminAuditPageReplica", () => {
  it("shows the page in the URL", () => {
    renderAt("?page=2");
    expect(summary()).toContain("Showing 11 to 14 of 14");
  });

  it("moves an overflow page back to the last page", () => {
    renderAt("?page=9");
    expect(summary()).toContain("Showing 11 to 14 of 14");
  });

  it("goes to the chosen page through the URL", () => {
    const router = renderAt("?page=2");
    fireEvent.click(screen.getByRole("link", { name: "1" }));
    expect(router.navigate).toHaveBeenCalledWith("/settings/audit", { replace: false });
  });
});
