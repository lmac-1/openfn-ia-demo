import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HealthQuery, Outcomes } from "../../types/workflow-health";
import WorkflowHealthPage from "./WorkflowHealthPage";

const loading = { data: null, error: null };

// A project the fixtures don't hold, as in Lightning: the picker label has to come from the props.
function renderPage(outcomes: HealthQuery<Outcomes> = loading) {
  const onDaysChange = vi.fn();
  render(
    <WorkflowHealthPage
      project={{ id: "lightning-sandbox", parentId: "lightning-parent", color: null, historyRetentionPeriod: null }}
      projectLabel="parent/child"
      workflow={{ id: "wf-9", name: "Daily sync" }}
      days="7"
      onDaysChange={onDaysChange}
      outcomes={outcomes}
      failures={loading}
      runs={loading}
    />
  );
  return { onDaysChange };
}

describe("WorkflowHealthPage", () => {
  it("labels the picker and links the crumbs from the props", () => {
    renderPage();
    // A sandbox shows "parent/child" as "parent:child".
    expect(screen.getByRole("button", { name: "parent:child" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Workflows" }).getAttribute("href")).toBe("/projects/lightning-sandbox/w");
    expect(screen.getByRole("link", { name: "Daily sync" }).getAttribute("href")).toBe("/projects/lightning-sandbox/w/wf-9");
  });

  it("hands a new range to the host", () => {
    const { onDaysChange } = renderPage();
    fireEvent.click(screen.getByRole("radio", { name: "Last 30 days" }));
    expect(onDaysChange).toHaveBeenCalledWith("30");
  });

  it("shows the host's error for a reply with no data", () => {
    renderPage({ data: null, error: "boom" });
    // Both Work orders cards read the outcomes reply.
    expect(screen.getAllByText("boom")).toHaveLength(2);
  });
});
