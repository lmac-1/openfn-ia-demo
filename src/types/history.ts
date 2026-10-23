/** Work orders, runs, steps, dataclips and logs. Types only: no data, no behaviour. */

export type RunState =
  | "available"
  | "claimed"
  | "started"
  | "success"
  | "failed"
  | "crashed"
  | "cancelled"
  | "killed"
  | "exception"
  | "lost";

/** A work order's state is its latest run's state, plus "pending"/"rejected". */
export type WorkOrderState = RunState | "pending" | "rejected";

export type DataclipType = "http_request" | "global" | "step_result" | "saved_input" | "kafka";

export interface Dataclip {
  id: string;
  projectId: string;
  type: DataclipType;
  name: string | null;
  body: unknown;
  insertedAt: string;
  /** Body wiped by the project's retention policy. */
  wiped: boolean;
}

export interface Step {
  id: string;
  runId: string;
  jobId: string;
  jobName: string;
  exitReason: "success" | "fail" | "crash" | "cancel" | "kill" | "exception" | "lost" | null;
  /** Why a killed step was killed (SecurityError, TimeoutError, OOMError…); picks the icon. */
  errorType?: string | null;
  startedAt: string;
  finishedAt: string | null;
  /** When the step row was written. A step older than its run was cloned from an earlier run. */
  insertedAt?: string;
  inputDataclipId: string;
  outputDataclipId: string | null;
}

export interface Run {
  id: string;
  workOrderId: string;
  state: RunState;
  startingTrigger: string | null;
  startingJob: string | null;
  createdBy: string | null;
  insertedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  stepIds: string[];
}

export interface WorkOrder {
  id: string;
  projectId: string;
  workflowId: string;
  workflowName: string;
  state: WorkOrderState;
  dataclipId: string;
  insertedAt: string;
  lastActivity: string;
  runIds: string[];
}

export interface LogLine {
  timestamp: string;
  /** "R/T", "JOB", "ADA", "CLI"; the worker may add others. */
  source: string;
  /** "debug", "info", "warn", "error"; anything else ("success", "always") always shows. */
  level: string;
  message: string;
  stepId?: string | null;
}

/** The run page's run (RunLive.Show): the detail rows and the version chip. */
export interface RunDetail {
  id: string;
  workOrderId: string;
  state: RunState;
  /** The creator's email, or "Webhook trigger" / "Cron trigger"; null when neither is known. */
  startedBy: string | null;
  insertedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  finalDataclipId: string | null;
  snapshot: { id: string; lockVersion: number; insertedAt: string };
}

/** The run page's workflow: the link and the version the chip compares against. */
export interface RunWorkflow {
  id: string;
  name: string;
  lockVersion: number;
}

/** A step on the run page: its own snapshot version pins the inspect link. */
export interface RunStep extends Omit<Step, "runId"> {
  insertedAt: string;
  snapshotLockVersion: number;
}

/** The dataclip page's record (DataclipLive.Show): metadata only, the body arrives separately. */
export interface DataclipDetail {
  id: string;
  type: DataclipType;
  insertedAt: string;
  updatedAt: string;
  wipedAt: string | null;
}

/** A selected step's input or output: the body arrives separately and may still be loading. */
export interface StepDataclip {
  id: string;
  wiped: boolean;
  body?: unknown;
}

export type SearchFieldId = "id" | "dataclip_name" | "body" | "log";

/** A step as History lists it, with whether its input dataclip was wiped. */
export interface HistoryStep extends Step {
  inputWiped: boolean;
}

/** A run with its steps, in order. */
export interface HistoryRun extends Run {
  steps: HistoryStep[];
}

/**
 * A work order as History lists it: Lightning preloads its runs (newest
 * first) with their steps, and whether its input dataclip was wiped.
 */
export interface HistoryWorkOrder extends WorkOrder {
  runs: HistoryRun[];
  dataclipWiped: boolean;
}
