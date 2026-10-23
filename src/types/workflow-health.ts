/** What WorkflowHealthController returns (assets/js/health/types.ts). Types only: no data, no behaviour. */

export const FAILURE_STATES = ["failed", "crashed", "killed", "exception", "lost", "rejected"] as const;

export type FailureState = (typeof FAILURE_STATES)[number];

export type WorkOrderStateCounts = Record<"success" | "cancelled" | FailureState, number>;

export interface ErrorSignature {
  count: number;
  exit_reason: string;
  error_type: string | null;
  job_id: string | null;
  step_name: string | null;
  adaptor: string | null;
}

export interface RunBucket {
  at: string;
  success: number;
  cancelled: number;
  failed: number;
  crashed: number;
  killed: number;
  exception: number;
  lost: number;
}

export interface HealthRange {
  days: "1" | "7" | "30";
  label: string;
}

/** The window a reply counts over. History links start at `from`. */
export interface HealthWindow {
  from: string;
  to: string;
}

/** The `outcomes` reply: one aggregate both donuts read. */
export interface Outcomes {
  window: HealthWindow;
  counts: WorkOrderStateCounts;
}

/** The `failures` reply, heaviest signature first. */
export interface ErrorSignatures {
  window: HealthWindow;
  signatures: ErrorSignature[];
}

/** The `runs` reply: run counts per bucket, cut on the reader's clock. */
export interface RunVolume {
  window: HealthWindow;
  /** The clock the server cut the grid on. Every label follows it. */
  timezone: string;
  /** Bar width in hours: 2 for 24 hours, 12 for 7 days, 24 for 30 days. */
  bucket_hours: number;
  buckets: RunBucket[];
}

/**
 * One endpoint's state, as Lightning's `useHealthQuery` returns it. Both null
 * is loading. `error` with no `data` is a failed load. Lightning's hook keeps
 * the last `{ data, error: null }` through a failed poll, so it never sends
 * both; a caller that does gets the numbers kept, with no error shown.
 */
export interface HealthQuery<T> {
  data: T | null;
  error: string | null;
}
