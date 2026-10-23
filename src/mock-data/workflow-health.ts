/**
 * Workflow health fixtures: what Lightning's `WorkflowHealthController`
 * returns for `outcomes`, `failures` and `runs` (assets/js/health/types.ts).
 * Static per workflow and per range; the demo never queries.
 */
import type { ErrorSignature, ErrorSignatures, HealthRange, Outcomes, RunBucket, RunVolume, WorkOrderStateCounts } from "../types/workflow-health";

const zero: WorkOrderStateCounts = {
  success: 0,
  cancelled: 0,
  failed: 0,
  crashed: 0,
  killed: 0,
  exception: 0,
  lost: 0,
  rejected: 0,
};

const NOW = Date.parse("2026-10-14T10:00:00Z");

/** A deterministic run volume: `n` buckets ending now, shaped by `seed`. */
function buckets(n: number, hours: number, scale: number, failEvery: number): RunBucket[] {
  return Array.from({ length: n }, (_, i) => {
    const wave = Math.round(scale * (0.6 + 0.4 * Math.sin(i * 0.9) ** 2));
    const failed = i % failEvery === 0 ? Math.max(1, Math.round(scale / 12)) : 0;
    return {
      at: new Date(NOW - (n - i) * hours * 3_600_000).toISOString(),
      success: wave,
      cancelled: i % 11 === 5 ? 1 : 0,
      failed,
      crashed: i % (failEvery * 3) === 2 ? 1 : 0,
      killed: 0,
      exception: 0,
      lost: 0,
    };
  });
}

const openhieSignatures: ErrorSignature[] = [
  {
    count: 9,
    exit_reason: "fail",
    error_type: "AdaptorError",
    job_id: "job-upload",
    step_name: "Upload to OpenHIE",
    adaptor: "@openfn/language-http@6.5.1",
  },
  {
    count: 4,
    exit_reason: "fail",
    error_type: "RuntimeError",
    job_id: "job-transform",
    step_name: "Transform to FHIR",
    adaptor: "@openfn/language-common@2.1.1",
  },
  {
    count: 3,
    exit_reason: "crash",
    error_type: "TimeoutError",
    job_id: null,
    step_name: null,
    adaptor: null,
  },
  {
    count: 1,
    exit_reason: "rejected",
    error_type: "RunLimitExceeded",
    job_id: null,
    step_name: null,
    adaptor: null,
  },
];

const data: Record<string, Record<HealthRange["days"], Pick<Outcomes, "counts"> & Pick<ErrorSignatures, "signatures"> & Pick<RunVolume, "bucket_hours" | "buckets">>> = {
  "wf-openhie": {
    "1": {
      counts: { ...zero, success: 41, failed: 1 },
      signatures: [{ ...openhieSignatures[0]!, count: 1 }],
      bucket_hours: 2,
      buckets: buckets(12, 2, 4, 7),
    },
    "7": {
      counts: { ...zero, success: 287, cancelled: 2, failed: 9, crashed: 3, rejected: 1 },
      signatures: openhieSignatures,
      bucket_hours: 12,
      buckets: buckets(14, 12, 20, 4),
    },
    "30": {
      counts: { ...zero, success: 1240, cancelled: 4, failed: 13, crashed: 3, rejected: 1 },
      signatures: openhieSignatures.map((s) => ({ ...s, count: s.count + (s.job_id ? 2 : 0) })),
      bucket_hours: 24,
      buckets: buckets(30, 24, 40, 5),
    },
  },
};

/**
 * The three replies for a workflow and range, each with its window, as the
 * endpoints send them. A workflow with no history is all zeroes.
 */
export function healthFor(
  workflowId: string,
  days: HealthRange["days"]
): { outcomes: Outcomes; failures: ErrorSignatures; runs: RunVolume } {
  const f = data[workflowId]?.[days] ?? {
    counts: zero,
    signatures: [],
    bucket_hours: days === "1" ? 2 : days === "7" ? 12 : 24,
    buckets: [],
  };
  const window = { from: new Date(NOW - Number(days) * 86_400_000).toISOString(), to: new Date(NOW).toISOString() };
  return {
    outcomes: { window, counts: f.counts },
    failures: { window, signatures: f.signatures },
    runs: { window, timezone: "UTC", bucket_hours: f.bucket_hours, buckets: f.buckets },
  };
}
