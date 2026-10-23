import type { ErrorSignature, RunBucket, WorkOrderStateCounts } from "../../../types/workflow-health";

/** Zero-filled work order counts, so a test names only the states it cares about. */
export const counts = (overrides: Partial<WorkOrderStateCounts> = {}): WorkOrderStateCounts => ({
  success: 0,
  failed: 0,
  crashed: 0,
  cancelled: 0,
  killed: 0,
  exception: 0,
  lost: 0,
  rejected: 0,
  ...overrides,
});

/** The same for one run bucket, which has no `rejected`. */
export const bucket = (at: string, overrides: Partial<RunBucket> = {}): RunBucket => ({
  at,
  success: 0,
  cancelled: 0,
  failed: 0,
  crashed: 0,
  killed: 0,
  exception: 0,
  lost: 0,
  ...overrides,
});

/** One triage row: a step that failed 62 times with a runtime error. */
export const signature = (overrides: Partial<ErrorSignature> = {}): ErrorSignature => ({
  count: 62,
  exit_reason: "fail",
  error_type: "RuntimeError",
  job_id: "a1b2c3d4-0000-0000-0000-000000000000",
  step_name: "Map-beneficiary",
  adaptor: "@openfn/language-common@2.0.0",
  ...overrides,
});
