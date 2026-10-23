import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import DataclipShowPage from "./DataclipShowPage";

const ID = "9a8b7c6d-3333-4a4a-8b8b-0123456789ab";

function renderPage(props: Partial<React.ComponentProps<typeof DataclipShowPage>> = {}) {
  const router: Router = {
    navigate: vi.fn(),
    useHref: (to) => to,
    useLocation: () => ({ pathname: `/projects/p1/dataclips/${ID}/show`, search: "", hash: "" }),
  };
  render(
    <RouterProvider value={router}>
      <DataclipShowPage
        project={{ id: "p1", parentId: null, color: null }}
        projectLabel="Malawi HIV"
        dataclip={{ id: ID, type: "http_request", insertedAt: "2026-10-14T09:30:00Z", updatedAt: "2026-10-14T09:31:00Z", wipedAt: null }}
        body={'{\n  "x": 1\n}'}
        {...props}
      />
    </RouterProvider>
  );
}

describe("DataclipShowPage", () => {
  it("shows the dataclip's details and its body", () => {
    renderPage();
    expect(screen.getByText("Dataclip").textContent).toContain(ID.slice(0, 8));
    expect(screen.getByText(ID)).toBeTruthy();
    expect(screen.getByText("http_request")).toBeTruthy();
    expect(screen.queryByText("Wiped")).toBeNull();
    expect(screen.getByText(/"x"/)).toBeTruthy();
  });

  it("shows when the dataclip was wiped, and no body", () => {
    renderPage({ dataclip: { id: ID, type: "step_result", insertedAt: "2026-10-14T09:30:00Z", updatedAt: "2026-10-14T09:31:00Z", wipedAt: "2026-10-20T00:00:00Z" }, body: undefined });
    expect(screen.getByText("Wiped")).toBeTruthy();
    expect(screen.getByText("No Data Available")).toBeTruthy();
  });

  it("draws an empty viewer while the body is on its way", () => {
    renderPage({ body: undefined });
    expect(screen.queryByText("No Data Available")).toBeNull();
    expect(screen.queryByText(/"x"/)).toBeNull();
  });
});
