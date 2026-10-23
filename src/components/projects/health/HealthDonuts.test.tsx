import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FAILURE_STATES } from "../../../types/workflow-health";
import { counts } from "./fixtures";
import { FailureBreakdownDonut, OutcomesDonut } from "./HealthDonuts";

const links = { projectId: "proj-1", workflowId: "wf-1", from: "2026-08-01T10:00:00Z" };
const historyHref = (...filters: string[]) =>
  "/projects/proj-1/history?filters%5Bworkflow_id%5D=wf-1&filters%5Blog%5D=true&filters%5Bdate_after%5D=2026-08-01T10%3A00%3A00Z" +
  filters.map((f) => `&filters%5B${f}%5D=true`).join("");

const outcomes = (c: ReturnType<typeof counts>, emptyMessage = "No work orders") =>
  render(<OutcomesDonut counts={c} emptyMessage={emptyMessage} {...links} />);
const breakdown = (c: ReturnType<typeof counts>, emptyMessage = "No failures") =>
  render(<FailureBreakdownDonut counts={c} emptyMessage={emptyMessage} {...links} />);

describe("OutcomesDonut", () => {
  it("folds every failure state into one Failed slice", () => {
    outcomes(counts({ success: 1146, failed: 98, crashed: 24, killed: 12, lost: 7, rejected: 3 }));
    expect(screen.getByText("Success")).toBeTruthy();
    expect(screen.getByText("1,146")).toBeTruthy();
    // 98 + 24 + 12 + 7 + 3, and 144 of 1,290 work orders.
    expect(screen.getByText("Failed")).toBeTruthy();
    expect(screen.getByText("144")).toBeTruthy();
    expect(screen.getByText("(11.2%)")).toBeTruthy();
  });

  it("shows the success rate in the middle of the ring", () => {
    outcomes(counts({ success: 1146, failed: 144 }));
    expect(screen.getByText("88.8%")).toBeTruthy();
    expect(screen.getByText("success")).toBeTruthy();
  });

  it("never rounds a workflow with failures to 100%", () => {
    outcomes(counts({ success: 2500, failed: 1 }));
    expect(screen.getByText("<100%")).toBeTruthy();
    expect(screen.getByText("(<100%)")).toBeTruthy();
    expect(screen.getByText("(<0.1%)")).toBeTruthy();
  });

  it("draws cancelled as its own slice, outside the Failed one", () => {
    outcomes(counts({ success: 80, failed: 10, cancelled: 10 }));
    expect(screen.getByText("Cancelled")).toBeTruthy();
    // Failed is 10, not 20: cancelled is not folded in.
    expect(screen.getAllByText("10")).toHaveLength(2);
    expect(screen.getAllByText("(10.0%)")).toHaveLength(2);
  });

  it("leaves cancelled out of the success rate", () => {
    outcomes(counts({ success: 9, cancelled: 1 }));
    expect(screen.getByText("100.0%")).toBeTruthy();
  });

  it("has no success rate when every work order was cancelled", () => {
    outcomes(counts({ cancelled: 3 }));
    expect(screen.getByText("–")).toBeTruthy();
  });

  it("leaves the cancelled row out when nothing was cancelled, but keeps Failed at zero", () => {
    outcomes(counts({ success: 80 }));
    expect(screen.queryByText("Cancelled")).toBeNull();
    expect(screen.getByText("Failed")).toBeTruthy();
  });

  it("shows the empty message rather than a donut of zeroes", () => {
    outcomes(counts(), "No finished work orders in the last 30 days");
    expect(screen.getByText("No finished work orders in the last 30 days")).toBeTruthy();
    expect(screen.queryByText("Success")).toBeNull();
  });

  describe("legend links", () => {
    it("sends Success to History filtered to that state and window", () => {
      outcomes(counts({ success: 80, failed: 10 }));
      expect(screen.getByRole("link", { name: /Success/ }).getAttribute("href")).toBe(historyHref("success"));
    });

    it("ticks every failure state on the Failed slice", () => {
      outcomes(counts({ success: 80, failed: 10, lost: 2 }));
      const href = screen.getByRole("link", { name: /Failed/ }).getAttribute("href")!;
      for (const state of FAILURE_STATES) expect(href).toContain(`filters%5B${state}%5D=true`);
      expect(href).not.toContain("success");
    });
  });
});

describe("FailureBreakdownDonut", () => {
  it("lists each failure state with its count and share of failures", () => {
    breakdown(counts({ success: 1146, failed: 98, crashed: 24, killed: 12, lost: 7 }));
    expect(screen.getByText("failed")).toBeTruthy();
    expect(screen.getByText("98")).toBeTruthy();
    // 98 of 141 failures, not of all work orders.
    expect(screen.getByText("(69.5%)")).toBeTruthy();
    expect(screen.getByText("crashed")).toBeTruthy();
    expect(screen.getByText("(17.0%)")).toBeTruthy();
  });

  it("counts the failures in the middle of the ring", () => {
    const { rerender } = breakdown(counts({ failed: 98, crashed: 43 }));
    expect(screen.getByText("141")).toBeTruthy();
    expect(screen.getByText("failures")).toBeTruthy();

    rerender(<FailureBreakdownDonut counts={counts({ failed: 1 })} emptyMessage="No failures" {...links} />);
    expect(screen.getByText("failure")).toBeTruthy();
  });

  it("gives rejected work orders a slice of their own", () => {
    breakdown(counts({ failed: 3, rejected: 1 }));
    expect(screen.getByText("rejected")).toBeTruthy();
    expect(screen.getByText("(25.0%)")).toBeTruthy();
  });

  it("omits states that never happened", () => {
    breakdown(counts({ failed: 3 }));
    expect(screen.getByText("failed")).toBeTruthy();
    expect(screen.queryByText("killed")).toBeNull();
    expect(screen.queryByText("exception")).toBeNull();
  });

  it("never slices cancelled, however many there are", () => {
    breakdown(counts({ failed: 3, cancelled: 90 }));
    expect(screen.queryByText("cancelled")).toBeNull();
    // 3 of 3 failures, not 3 of 93.
    expect(screen.getByText("(100.0%)")).toBeTruthy();
  });

  it("is empty when the only other outcome was cancelled", () => {
    breakdown(counts({ success: 10, cancelled: 5 }), "No failures in the last 30 days");
    expect(screen.getByText("No failures in the last 30 days")).toBeTruthy();
  });

  it("is empty when every work order succeeded", () => {
    breakdown(counts({ success: 1146 }), "No failures in the last 30 days");
    expect(screen.getByText("No failures in the last 30 days")).toBeTruthy();
    expect(screen.queryByText("failed")).toBeNull();
  });

  it("links each slice to that one state over the picked window", () => {
    breakdown(counts({ failed: 10, lost: 2 }));
    expect(screen.getByRole("link", { name: /lost/ }).getAttribute("href")).toBe(historyHref("lost"));
  });
});
