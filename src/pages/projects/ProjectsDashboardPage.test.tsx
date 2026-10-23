import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import { ToastProvider } from "../../components/Toast";
import type { ProjectOverview } from "../../types/workflows";
import ProjectsDashboardPage from "./ProjectsDashboardPage";

const projects: ProjectOverview[] = [
  { id: "p1", name: "Malawi HIV", role: "owner", workflowsCount: 2, collaboratorsCount: 3, lastUpdatedAt: "2026-10-01T10:00:00Z" },
  { id: "p2", name: "Kenya TB", role: "support", workflowsCount: 0, collaboratorsCount: 1, lastUpdatedAt: null },
];

function renderPage(props: Partial<React.ComponentProps<typeof ProjectsDashboardPage>> = {}) {
  const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/projects", search: "", hash: "" }) };
  const onCreate = vi.fn().mockResolvedValue(undefined);
  render(
    <RouterProvider value={router}>
      <ToastProvider>
        <ProjectsDashboardPage firstName="Amy" projects={projects} onCreate={onCreate} {...props} />
      </ToastProvider>
    </RouterProvider>
  );
  return { onCreate, router };
}

describe("ProjectsDashboardPage", () => {
  it("lists the projects it is given with their counts and roles", () => {
    renderPage();
    const row = screen.getByText("Malawi HIV").closest("tr")!;
    expect(row.textContent).toContain("Owner");
    expect(row.textContent).toContain("2");
    expect(screen.getByText("Kenya TB").closest("tr")!.textContent).toContain("Support");
    expect(screen.getByText("N/A")).toBeTruthy();
  });

  it("shows the empty state with no projects", () => {
    renderPage({ projects: [] });
    expect(screen.getByText("No projects found.")).toBeTruthy();
  });

  it("creates a project with the url-safe name and closes the modal", async () => {
    const { onCreate } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "My Awesome Project" } });
    fireEvent.submit(document.getElementById("project-form")!);

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ name: "my-awesome-project", description: "" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("does not create a project when the modal is cancelled", async () => {
    const { onCreate } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onCreate).not.toHaveBeenCalled();
  });
});
