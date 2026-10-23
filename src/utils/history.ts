/**
 * Pure helpers over history records: log filtering, channel request events,
 * failure counts and the workflows-index metric cards. No fixture access.
 */
import type { ChannelEvent, ChannelRequest } from "../types/channels";
import type { LogLine } from "../types/history";
import type { ProjectMetrics, WorkflowStats } from "../types/workflows";
import { FAILURE_STATES, type WorkOrderStateCounts } from "../types/workflow-health";

const levelScore = (l: string) => ({ debug: 0, info: 1, warn: 2, error: 3 })[l] ?? 4;

/** The log lines a level filter lets through: `level` and everything above it. */
export function logsAtLevel<T extends { level: string }>(logs: T[], level: LogLine["level"]): T[] {
  return logs.filter((l) => levelScore(l.level) >= levelScore(level));
}

/** Prefers the destination response event, falls back to the error event. */
export function primaryEvent(cr: Pick<ChannelRequest, "events">): ChannelEvent | undefined {
  return cr.events.find((e) => e.type === "destination_response") ?? cr.events.find((e) => e.type === "error");
}

export const failureTotal = (counts: WorkOrderStateCounts) =>
  FAILURE_STATES.reduce((sum, state) => sum + counts[state], 0);

/**
 * A History link scoped to the workflow plus `filters` (Lightning's
 * historyUrl.ts). `log` is named so History's search-field buttons match what
 * it searches. Empty values are skipped; a list goes as repeated `key[]`.
 */
export function historyUrl(
  projectId: string,
  workflowId: string,
  filters: Record<string, string | readonly string[] | null | undefined>
): string {
  const params = new URLSearchParams({ "filters[workflow_id]": workflowId, "filters[log]": "true" });
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) for (const item of value) params.append(`filters[${key}][]`, item);
    else if (typeof value === "string" && value) params.set(`filters[${key}]`, value);
  }
  return `/projects/${projectId}/history?${params.toString()}`;
}

/** The History link for the states a slice counts, from `from`: one flag per state. */
export const stateUrl = (projectId: string, workflowId: string, from: string, ...states: (keyof WorkOrderStateCounts)[]) =>
  historyUrl(projectId, workflowId, { date_after: from, ...Object.fromEntries(states.map((state) => [state, "true"])) });

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);

export function projectMetricsFor(stats: WorkflowStats[]): ProjectMetrics {
  const sum = (f: (s: WorkflowStats) => number) => stats.reduce((acc, s) => acc + f(s), 0);
  const woTotal = sum((s) => s.workordersCount);
  const woFailed = sum((s) => s.failedWorkordersCount);
  const runTotal = sum((s) => s.runs.total);
  const runSuccess = sum((s) => s.runs.success);
  return {
    workOrders: {
      total: woTotal,
      pending: sum((s) => s.pendingWorkorders),
      failed: woFailed,
      failedPercentage: pct(woFailed, woTotal),
    },
    runs: {
      total: runTotal,
      pending: sum((s) => s.runs.pending),
      success: runSuccess,
      successRate: pct(runSuccess, runTotal),
    },
  };
}
