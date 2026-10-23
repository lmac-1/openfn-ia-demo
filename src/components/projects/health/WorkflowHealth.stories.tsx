import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import WorkflowHealth from "./WorkflowHealth";
import { DEFAULT_HEALTH_DAYS, HEALTH_LOAD_ERROR } from "../../../constants";
import { projects } from "../../../mock-data/projects";
import { healthFor } from "../../../mock-data/workflow-health";
import type { HealthRange } from "../../../types/workflow-health";
import { withRouter, withGrayPanel } from "../../../stories/decorators";

const loaded = <T,>(data: T) => ({ data, error: null });
const loading = { data: null, error: null };
const failed = { data: null, error: HEALTH_LOAD_ERROR };

type State = "loaded" | "loading" | "failuresError" | "failedRefresh";

/** Holds the range like WorkflowHealthPage.replica does, so the picker switches data. */
function WithRange({
  workflowId,
  state = "loaded",
  ...props
}: {
  workflowId: string;
  workflowName: string;
  historyRetentionPeriod?: number;
  state?: State;
}) {
  const [days, setDays] = useState<HealthRange["days"]>(DEFAULT_HEALTH_DAYS);
  const h = healthFor(workflowId, days);
  return (
    <WorkflowHealth
      {...props}
      projectId={projects[0]!.id}
      workflowId={workflowId}
      days={days}
      onDaysChange={setDays}
      outcomes={state === "loading" ? loading : loaded(h.outcomes)}
      failures={
        {
          loaded: loaded(h.failures),
          loading,
          failuresError: failed,
          failedRefresh: { data: h.failures, error: HEALTH_LOAD_ERROR },
        }[state]
      }
      runs={state === "loading" ? loading : loaded(h.runs)}
    />
  );
}

const meta: Meta<typeof WorkflowHealth> = {
  title: "Projects/Health/WorkflowHealth",
  component: WorkflowHealth,
  decorators: [withRouter, withGrayPanel],
};
export default meta;
type Story = StoryObj<typeof WorkflowHealth>;

export const WithFailures: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" historyRetentionPeriod={90} />,
};
export const NoHistory: Story = {
  render: () => <WithRange workflowId="wf-facility-sync" workflowName="Facility registry sync" historyRetentionPeriod={90} />,
};
/** 14 days of history: "Last 30 days" is disabled, and hovering it says why. */
export const ShortRetention: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" historyRetentionPeriod={14} />,
};
/** Every request out: each panel holds its frame. */
export const Loading: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" state="loading" />,
};
/** The failures endpoint failed: its two panels say so, the donuts keep their numbers. */
export const FailuresError: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" state="failuresError" />,
};
/** Both numbers and an error (Lightning's hook never sends both): the numbers win and no error shows. */
export const FailedRefresh: Story = {
  render: () => <WithRange workflowId="wf-openhie" workflowName="OpenHIE Workflow" state="failedRefresh" />,
};
