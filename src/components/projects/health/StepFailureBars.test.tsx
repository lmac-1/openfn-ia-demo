import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ErrorSignature } from "../../../types/workflow-health";
import { signature } from "./fixtures";
import StepFailureBars from "./StepFailureBars";

// A run-level failure: nothing reached a step, so there is no job to blame.
const runLevel = (overrides: Partial<ErrorSignature> = {}) =>
  signature({ exit_reason: "lost", job_id: null, step_name: null, adaptor: null, ...overrides });

const bars = (signatures: ErrorSignature[], emptyMessage = "No failures") =>
  render(<StepFailureBars signatures={signatures} emptyMessage={emptyMessage} />);

const rows = () => screen.getAllByRole("listitem").map((li) => li.textContent);

// The bar is aria-hidden decoration (the count beside it is the row's value),
// so find it from its row, which carries the step name as a title.
const bar = (label: string) => screen.getByTitle(label).closest("li")!.querySelector<HTMLElement>("[aria-hidden] > div")!;

describe("StepFailureBars", () => {
  it("lists one row per step, heaviest first, with its adaptor", () => {
    bars([
      signature({ count: 36, job_id: "job-b", step_name: "Post-to-Punto" }),
      signature({ count: 62, job_id: "job-a", step_name: "Map-beneficiary" }),
      signature({ count: 12, job_id: "job-c", step_name: "Fetch-households" }),
    ]);
    expect(rows()).toEqual([
      "Map-beneficiarycommon adaptor62",
      "Post-to-Puntocommon adaptor36",
      "Fetch-householdscommon adaptor12",
    ]);
  });

  it("shows an adaptor it cannot name as its package, without the version", () => {
    bars([signature({ adaptor: "@acme/custom-thing@1.2.0" })]);
    expect(rows()).toEqual(["Map-beneficiary@acme/custom-thing adaptor62"]);
  });

  it("folds a step together across its exit reasons and error types", () => {
    bars([
      signature({ count: 40, error_type: "RuntimeError" }),
      signature({ count: 22, exit_reason: "crash", error_type: "OOMError" }),
    ]);
    expect(rows()).toEqual(["Map-beneficiarycommon adaptor62"]);
  });

  it("counts failures with no failing step in their own row", () => {
    bars([signature({ count: 62 }), runLevel({ count: 20 }), runLevel({ count: 4, exit_reason: "rejected" })]);
    expect(rows()).toEqual(["Map-beneficiarycommon adaptor62", "No failing step24"]);
  });

  it("scales each bar against the heaviest row, not the total", () => {
    bars([
      signature({ count: 60, job_id: "job-a", step_name: "Heaviest" }),
      signature({ count: 15, job_id: "job-b", step_name: "Lightest" }),
    ]);
    expect(bar("Heaviest").style.width).toBe("100%");
    expect(bar("Lightest").style.width).toBe("25%");
  });

  it("is empty when nothing failed", () => {
    bars([], "No failures in the last 30 days");
    expect(screen.getByText("No failures in the last 30 days")).toBeTruthy();
    expect(screen.queryAllByRole("listitem")).toEqual([]);
  });

  it("labels a step whose name never resolved without merging it into the no failing step row", () => {
    bars([signature({ count: 3, step_name: null }), runLevel({ count: 2 })]);
    expect(rows()).toEqual(["(unknown step)common adaptor3", "No failing step2"]);
  });
});
