import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ErrorSignature, FailureState } from "../../../types/workflow-health";
import { signature } from "./fixtures";
import { FAILURE_COLORS } from "./palette";
import TriageTable from "./TriageTable";

const table = (signatures: ErrorSignature[], emptyMessage = "No failures") =>
  render(<TriageTable signatures={signatures} emptyMessage={emptyMessage} projectId="proj-1" workflowId="wf-1" from="2026-08-01T10:00:00Z" />);

const rowText = (name: RegExp) => within(screen.getByRole("row", { name })).getByRole("cell", { name }).textContent;
const view = () => screen.getByRole("link", { name: "View history" });
const history = (...filters: string[]) =>
  "/projects/proj-1/history?filters%5Bworkflow_id%5D=wf-1&filters%5Blog%5D=true&filters%5Bdate_after%5D=2026-08-01T10%3A00%3A00Z" +
  filters.join("");
// jsdom normalises a hex colour to rgb, so compare both through a style.
const rgb = (colour: string) => {
  const el = document.createElement("i");
  el.style.backgroundColor = colour;
  return el.style.backgroundColor;
};

describe("TriageTable", () => {
  it("lays the signature out on three lines, adaptor named as the diagram names it", () => {
    table([signature()]);
    expect(screen.getByText("failed")).toBeTruthy();
    expect(screen.getByText("fail:RuntimeError @ Map-beneficiary")).toBeTruthy();
    expect(screen.getByText("common adaptor")).toBeTruthy();
    expect(screen.getByRole("cell", { name: "62" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Work orders" })).toBeTruthy();
  });

  it("drops the step clause when nothing reached a step", () => {
    table([signature({ exit_reason: "crash", error_type: "CompileError", job_id: null, step_name: null, adaptor: null })]);
    const text = rowText(/CompileError/);
    expect(text).toContain("crash:CompileError");
    expect(text).not.toContain("@");
    expect(text).not.toContain("[");
  });

  it("names a rejected work order and tips it", () => {
    table([signature({ exit_reason: "rejected", error_type: "RunLimitExceeded", job_id: null, step_name: null, adaptor: null })]);
    expect(rowText(/RunLimitExceeded/)).toContain("rejected:RunLimitExceeded");
    expect(screen.getByText("The project was over its run limit, so no run was created for this request.")).toBeTruthy();
  });

  it("shows the tip written for the error type", () => {
    table([signature({ error_type: "OOMError" })]);
    expect(screen.getByText("The run used more memory than it's allowed and was stopped.")).toBeTruthy();
  });

  it("tips the raw JS names that reach Lightning in place of RuntimeCrash", () => {
    table([signature({ exit_reason: "crash", error_type: "ReferenceError" }), signature({ exit_reason: "crash", error_type: "SyntaxError" })]);
    expect(screen.getByText(/often a typo or a missing import/)).toBeTruthy();
    expect(screen.getByText(/wasn't in the format it expected/)).toBeTruthy();
  });

  it("falls back to the default tip for an unmapped or missing type", () => {
    table([signature({ error_type: "SomeUnmappedError" }), signature({ error_type: null, step_name: "Verify-cedula" })]);
    expect(screen.getAllByText("The step failed without a recognised error type; check its logs.")).toHaveLength(2);
    expect(rowText(/unknown/)).toContain("fail:unknown @ Verify-cedula");
  });

  it("treats an empty error type as a missing one", () => {
    table([signature({ error_type: "" })]);
    expect(rowText(/unknown/)).toContain("fail:unknown @ Map-beneficiary");
    expect(screen.getByText("The step failed without a recognised error type; check its logs.")).toBeTruthy();
  });

  it("shows the empty message when nothing failed", () => {
    table([], "No failures in the last 30 days");
    expect(screen.getByText("No failures in the last 30 days")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  describe("View history button", () => {
    it("links a normal row to History filtered on the signature", () => {
      table([signature()]);
      expect(view().getAttribute("href")).toBe(
        history(
          "&filters%5Berror_signature_exit_reason%5D=fail",
          "&filters%5Berror_signature_error_type%5D=RuntimeError",
          "&filters%5Berror_signature_job_id%5D=a1b2c3d4-0000-0000-0000-000000000000"
        )
      );
    });

    it("omits job_id and error_type for a row with no step", () => {
      table([signature({ exit_reason: "crash", error_type: null, job_id: null, step_name: null, adaptor: null })]);
      expect(view().getAttribute("href")).toBe(history("&filters%5Berror_signature_exit_reason%5D=crash"));
    });

    it("links a rejected row to the rejected status filter, not the signature", () => {
      table([signature({ exit_reason: "rejected", error_type: "RunLimitExceeded", job_id: null, step_name: null, adaptor: null })]);
      expect(view().getAttribute("href")).toBe(history("&filters%5Brejected%5D=true"));
    });

    it("renders no button when exit_reason never resolved", () => {
      table([signature({ exit_reason: "" })]);
      expect(screen.queryByRole("link", { name: "View history" })).toBeNull();
    });
  });

  describe("failure state", () => {
    it.each<[string, FailureState]>([
      ["fail", "failed"],
      ["crash", "crashed"],
      ["kill", "killed"],
      ["exception", "exception"],
      ["lost", "lost"],
      ["rejected", "rejected"],
    ])("names a %s exit reason %s, with its donut colour", (exit_reason, state) => {
      table([signature({ exit_reason })]);
      const dot = screen.getByText(state).querySelector<HTMLElement>('[aria-hidden="true"]')!;
      expect(dot.style.backgroundColor).toBe(rgb(FAILURE_COLORS[state]));
    });

    it("names an unlisted exit reason by its error type, with no dot", () => {
      table([signature({ exit_reason: "timeout", error_type: "TimeoutError" })]);
      expect(screen.getByText("TimeoutError").querySelector('[aria-hidden="true"]')).toBeNull();
    });
  });
});
