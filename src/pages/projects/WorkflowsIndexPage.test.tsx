import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import { ToastProvider } from "../../components/Toast";
import type { WorkflowRow } from "../../types/workflows";
import WorkflowsIndexPage from "./WorkflowsIndexPage";

const row = (id: string, name: string, extra: Partial<WorkflowRow> = {}): WorkflowRow => ({
  workflow: { id, name, updatedAt: "2026-10-01T10:00:00Z", enabled: true, triggerType: "webhook" },
  lastWorkOrder: { state: "failed", updatedAt: "2026-10-02T10:00:00Z" },
  lastFailedAt: "2026-10-02T10:00:00Z",
  workordersCount: 4,
  failedWorkordersCount: 1,
  stepCount: 4,
  stepSuccessRate: 75,
  historyHref: `/projects/p1/history?filters[workflow_id]=${id}`,
  failedHistoryHref: `/projects/p1/history?filters[workflow_id]=${id}&filters[failed]=true`,
  state: "live",
  ...extra,
});

const stats = [
  row("wf-1", "Intake"),
  row("wf-2", "Weekly report", {
    workflow: { id: "wf-2", name: "Weekly report", updatedAt: "2026-10-01T10:00:00Z", enabled: false, triggerType: "cron" },
    lastWorkOrder: null,
    lastFailedAt: null,
    workordersCount: 0,
    failedWorkordersCount: 0,
    stepCount: 0,
    stepSuccessRate: 0,
    state: "draft",
    triggerEnabled: false,
  }),
];

const metrics = {
  workOrders: { total: 10, pending: 6, failed: 2, failedPercentage: 20 },
  runs: { total: 10, pending: 6, success: 2, successRate: 50 },
};

function renderPage(props: Partial<React.ComponentProps<typeof WorkflowsIndexPage>> = {}, search = "") {
  const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/projects/p1/w", search, hash: "" }) };
  const handlers = {
    onSearch: vi.fn(),
    onClear: vi.fn(),
    onToggle: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <RouterProvider value={router}>
      <ToastProvider>
        <WorkflowsIndexPage
          project={{ id: "p1", parentId: null, color: null }}
          projectLabel="Malawi HIV"
          period="last 30 days"
          stats={stats}
          metrics={metrics}
          pendingHref="/projects/p1/history?filters[pending]=true"
          failedHref="/projects/p1/history?filters[failed]=true"
          searchTerm=""
          sort={{ key: "name", direction: "asc" }}
          canCreateWorkflow
          canDeleteWorkflow
          {...handlers}
          {...props}
        />
      </ToastProvider>
    </RouterProvider>
  );
  return { ...handlers, router };
}

const rowOf = (name: string) => screen.getByText(name).closest("tr")!;

describe("WorkflowsIndexPage", () => {
  it("lists the rows it is given with their counts and links", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Workflows (2)" })).toBeTruthy();
    const intake = rowOf("Intake");
    expect(intake.textContent).toContain("Failed");
    expect(intake.textContent).toContain("(4 steps, 75.0% success)");
    expect(screen.getByRole("link", { name: "4" }).getAttribute("href")).toBe("/projects/p1/history?filters[workflow_id]=wf-1");
    const weekly = rowOf("Weekly report");
    expect(weekly.textContent).toContain("Nothing last 30 days");
    expect(weekly.textContent).toContain("N/A");
    expect(weekly.querySelectorAll("a[href*=history]")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "6 pending" }).getAttribute("href")).toBe("/projects/p1/history?filters[pending]=true");
  });

  it("searches and clears through the host", () => {
    const { onSearch, onClear } = renderPage({ searchTerm: "int" });
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "inta" } });
    expect(onSearch).toHaveBeenCalledWith("inta");
    fireEvent.click(document.getElementById("clear_search_button")!);
    expect(onClear).toHaveBeenCalled();
  });

  it("offers to create a workflow when a search finds nothing", () => {
    renderPage({ stats: [], searchTerm: "nonexistent" });
    expect(screen.getByText(/No workflows found matching "nonexistent"/).textContent).toContain("create a new one");
    expect(screen.getByRole("link", { name: "create a new one" }).getAttribute("href")).toBe("/projects/p1/w/new");
  });

  it("switches and deletes through the host, asking before a delete", () => {
    const { onToggle, onDelete } = renderPage();
    // The switch is named by its tooltip, as Lightning's toggle was.
    fireEvent.click(screen.getByRole("switch", { name: "This workflow is inactive (manual runs only)" }));
    expect(onToggle).toHaveBeenCalledWith("wf-2", true);

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(rowOf("Intake").querySelector("button:last-child")!);
    expect(confirm).toHaveBeenCalledWith("Are you sure you'd like to delete this workflow?");
    expect(onDelete).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(rowOf("Intake").querySelector("button:last-child")!);
    expect(onDelete).toHaveBeenCalledWith("wf-1");
    confirm.mockRestore();
  });

  it("says something went wrong when a switch fails without a message", async () => {
    renderPage({ onToggle: vi.fn().mockRejectedValue(new Error("")) });
    fireEvent.click(screen.getByRole("switch", { name: "This workflow is inactive (manual runs only)" }));
    expect(await screen.findByText("Something went wrong. Please try again.")).toBeTruthy();
  });

  it("hides Delete and disables Create without the permissions", () => {
    renderPage({ canCreateWorkflow: false, canDeleteWorkflow: false });
    expect(screen.queryByText("Delete")).toBeNull();
    expect((screen.getByRole("button", { name: "Create new workflow" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("links each column to the URL that re-sorts it: the current one flips, another starts ascending", () => {
    renderPage({ searchTerm: "intake" }, "?q=intake&sort=name&dir=asc");
    expect(screen.getByRole("link", { name: "Name" }).getAttribute("href")).toBe("/projects/p1/w?q=intake&sort=name&dir=desc");
    expect(screen.getByRole("link", { name: "Work Orders" }).getAttribute("href")).toBe(
      "/projects/p1/w?q=intake&sort=workorders_count&dir=asc"
    );
  });

  it("says so when the host refuses a switch", async () => {
    renderPage({ onToggle: vi.fn().mockRejectedValue(new Error("No more workflows")) });
    fireEvent.click(rowOf("Weekly report").querySelector("[role=switch]")!);
    expect(await screen.findByText("No more workflows")).toBeTruthy();
  });

  it("shows the lifecycle state instead of a switch outside a sandbox", () => {
    renderPage({ lifecycle: true });
    expect(screen.getByRole("columnheader", { name: "State" })).toBeTruthy();
    expect(rowOf("Intake").textContent).toContain("Live");
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
  });
});
