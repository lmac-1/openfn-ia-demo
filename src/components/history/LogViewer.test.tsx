import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LogLine } from "../../types/history";
import { editors } from "../../test/monaco";
import LogViewer from "./LogViewer";

const line = (message: string, extra: Partial<LogLine> = {}): LogLine => ({
  timestamp: "2026-10-14T09:30:01Z",
  source: "R/T",
  level: "info",
  message,
  ...extra,
});

const logs: LogLine[] = [
  line("Starting operation 1"),
  line("debugging", { level: "debug", source: "JOB", stepId: "a" }),
  line('{"patient":1}', { source: "JOB", stepId: "a" }),
  line("Operation 1 complete", { stepId: "a" }),
  line("Starting operation 2", { stepId: "b" }),
  line("boom", { level: "error", source: "JOB", stepId: "a" }),
];

const editor = () => editors.at(-1)!;
const text = () => editor().model.getValue();

describe("LogViewer", () => {
  it("shows the lines at the chosen level and above, and reports a new level", () => {
    let picked = "";
    render(<LogViewer logs={logs} finished onLevelChange={(l) => (picked = l)} />);
    expect(text()).toBe(
      ['R/T Starting operation 1', 'JOB {', '  "patient": 1', "}", "R/T Operation 1 complete", "R/T Starting operation 2", "JOB boom"].join("\n")
    );
    expect(screen.getByRole("textbox", { name: "Run log" }).getAttribute("aria-readonly")).toBe("true");
    // Read-only keeps Tab from being Monaco's indent, so focus can leave.
    expect(editor()).toMatchObject({ theme: "default", options: { readOnly: true } });

    fireEvent.click(screen.getByRole("button", { name: "Log level" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "error" }));
    expect(picked).toBe("error");
    expect(text()).toBe("JOB boom");
  });

  it("marks the selected step's lines, merging neighbours, and reveals the first", () => {
    render(<LogViewer logs={logs} finished selectedStepId="a" />);
    // Lines 2-5 are step a (a pretty-printed message is three), 6 is b, 7 is a again.
    expect([...editor().highlighted]).toEqual([2, 3, 4, 5, 7]);
    expect(editor().ranges).toEqual([{ start: 2, end: 5 }, { start: 7, end: 7 }]);
    expect(editor().revealed).toEqual([2]);
  });

  it("moves the bar and reveals the new step's first line when the step changes", () => {
    const { rerender } = render(<LogViewer logs={logs} finished selectedStepId="a" />);
    rerender(<LogViewer logs={logs} finished selectedStepId="b" />);
    expect(editor().revealed).toEqual([2, 6]);
    expect([...editor().highlighted]).toEqual([6]);
  });

  it("keeps the reader's place when the level changes, as Lightning does", () => {
    render(<LogViewer logs={logs} finished defaultLevel="debug" selectedStepId="a" />);
    expect(editor().revealed).toEqual([2]);

    // At error only step a's "boom" is left, so its first line moves to 1.
    fireEvent.click(screen.getByRole("button", { name: "Log level" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "error" }));
    expect([...editor().highlighted]).toEqual([1]);
    expect(editor().revealed).toEqual([2]);
  });

  it("appends new lines to the model, and replaces it when the lines change otherwise", () => {
    const { rerender } = render(<LogViewer logs={logs.slice(0, 2)} finished={false} defaultLevel="debug" selectedStepId="a" />);
    const model = editor().model;
    expect(model.setValueCalls).toBe(1);

    rerender(<LogViewer logs={logs.slice(0, 4)} finished={false} defaultLevel="debug" selectedStepId="a" />);
    expect(model.setValueCalls).toBe(1);
    expect(model.applyEditsCalls).toBe(1);
    expect(text()).toBe(["R/T Starting operation 1", "JOB debugging", "JOB {", '  "patient": 1', "}", "R/T Operation 1 complete"].join("\n"));
    // The step's first line didn't move, so the view isn't yanked back to it.
    expect(editor().revealed).toEqual([2]);
    expect([...editor().highlighted]).toEqual([2, 3, 4, 5, 6]);

    rerender(<LogViewer logs={logs.slice(1, 4)} finished={false} defaultLevel="debug" selectedStepId="a" />);
    expect(model.setValueCalls).toBe(2);
    expect(text().startsWith("JOB debugging")).toBe(true);
  });

  it("says when no logs came, and pings while it waits", () => {
    render(<LogViewer logs={[]} finished />);
    expect(screen.getByText("No logs were received for this run.")).toBeTruthy();
    document.body.innerHTML = "";
    render(<LogViewer logs={[]} finished={false} waitingMessage="Waiting for worker" />);
    expect(screen.getByText("Waiting for worker")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
