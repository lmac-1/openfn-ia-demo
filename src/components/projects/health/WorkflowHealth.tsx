import { useState, type ReactNode } from "react";
import { formatNumber } from "../../../utils/format";
import type {
  ErrorSignatures,
  HealthQuery,
  HealthRange,
  Outcomes,
  RunVolume,
  WorkOrderStateCounts,
} from "../../../types/workflow-health";
import { FailureBreakdownDonut, OutcomesDonut } from "./HealthDonuts";
import RangePicker from "./RangePicker";
import StepFailureBars from "./StepFailureBars";
import TriageTable from "./TriageTable";
import Alert from "../../Alert";
import Card from "../../Card";
import Heading from "../../Heading";
import Spinner from "../../Spinner";
import Tabs from "../../Tabs";
import VolumeBars from "./VolumeBars";
import { FRAME } from "./palette";

type Tab = "Work orders" | "Runs";

const windowLabel = (days: HealthRange["days"]) => (days === "1" ? "24 hours" : `${days} days`);

const workOrders = (counts: WorkOrderStateCounts) => {
  const n = Object.values(counts).reduce((sum, c) => sum + c, 0);
  return `${formatNumber(n)} work order${n === 1 ? "" : "s"}`;
};

/**
 * The workflow health page body (assets/js/health/WorkflowHealth.tsx): the
 * workflow name with a range picker, Work orders / Runs tabs over the
 * Outcomes, Failure breakdown and Steps with failures cards (or Runs over
 * time), and the triage table. Each endpoint's reply comes in on its own, so
 * one panel can be loading or failed while the others show numbers.
 */
export default function WorkflowHealth({
  projectId,
  workflowId,
  workflowName,
  days,
  onDaysChange,
  outcomes,
  failures,
  runs,
  historyRetentionPeriod = null,
}: {
  projectId: string;
  workflowId: string;
  workflowName: string;
  /** The selected range. */
  days: HealthRange["days"];
  onDaysChange: (days: HealthRange["days"]) => void;
  /** The `outcomes` reply: both donuts. */
  outcomes: HealthQuery<Outcomes>;
  /** The `failures` reply: Steps with failures and the triage table. */
  failures: HealthQuery<ErrorSignatures>;
  /** The `runs` reply: Runs over time. */
  runs: HealthQuery<RunVolume>;
  /** Days of history the project keeps; longer ranges are disabled. */
  historyRetentionPeriod?: number | null;
}) {
  const [tab, setTab] = useState<Tab>("Work orders");
  const empty = (noun = "finished work orders") => `No ${noun} in the last ${windowLabel(days)}`;
  const links = { projectId, workflowId };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <Heading as="h1" size="xl" className="order-2 min-w-0 break-words md:order-1">
          {workflowName}
        </Heading>
        <div className="order-1 shrink-0 md:order-2">
          <RangePicker days={days} onChange={onDaysChange} retentionDays={historyRetentionPeriod} />
        </div>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: "Work orders", label: "Work orders" },
          { id: "Runs", label: "Runs" },
        ]}
        active={tab}
        onChange={setTab}
        label="Count by"
        className="border-b-0"
      />
      {tab === "Work orders" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" title="Outcomes" action={outcomes.data && meta(workOrders(outcomes.data.counts))} className="flex flex-col">
            <Panel query={outcomes}>
              {({ counts, window }) => <OutcomesDonut counts={counts} emptyMessage={empty()} {...links} from={window.from} />}
            </Panel>
          </Card>
          <Card padding="lg" title="Failure breakdown" className="flex flex-col">
            <Panel query={outcomes}>
              {({ counts, window }) => <FailureBreakdownDonut counts={counts} emptyMessage={empty("failures")} {...links} from={window.from} />}
            </Panel>
          </Card>
          <Card padding="lg" title="Steps with failures" className="flex flex-col">
            <Panel query={failures}>{({ signatures }) => <StepFailureBars signatures={signatures} emptyMessage={empty("failures")} />}</Panel>
          </Card>
        </div>
      ) : (
        <Card
          padding="lg"
          title="Runs over time"
          action={runs.data && meta(`${runs.data.bucket_hours >= 24 ? "daily" : `${runs.data.bucket_hours}-hour`} buckets · ${runs.data.timezone}`)}
        >
          <Panel query={runs}>
            {({ buckets, bucket_hours, timezone }) => (
              <VolumeBars buckets={buckets} hours={bucket_hours} timezone={timezone} emptyMessage={empty("runs")} {...links} />
            )}
          </Panel>
        </Card>
      )}

      <section className="space-y-3">
        <Heading as="h2" size="eyebrow">
          Triage - grouped by failure type
        </Heading>
        <Panel query={failures} card>
          {({ signatures, window }) => <TriageTable signatures={signatures} emptyMessage={empty("failures")} {...links} from={window.from} />}
        </Panel>
      </section>
    </div>
  );
}

/**
 * One panel's reply. Numbers win over an error, so a failed refresh keeps
 * what is on screen; an error with nothing to keep says so; neither is loading.
 * `card` puts those two in a card of their own (the triage table has none).
 */
function Panel<T>({ query, card = false, children }: { query: HealthQuery<T>; card?: boolean; children: (data: T) => ReactNode }) {
  if (query.data) return children(query.data);
  const status = query.error ? (
    <Alert type="danger">{query.error}</Alert>
  ) : (
    <div className={`${FRAME} flex items-center justify-center text-gray-400`} aria-busy="true">
      <Spinner size="md" label="Loading…" />
    </div>
  );
  return card ? <Card padding="lg">{status}</Card> : status;
}

/** The small gray note at the right of a card's title. */
const meta = (text: string) => <span className="text-xs text-gray-500">{text}</span>;
