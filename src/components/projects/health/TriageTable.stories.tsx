import type { Meta, StoryObj } from "@storybook/react";
import TriageTable from "./TriageTable";
import { healthFor } from "../../../mock-data/workflow-health";
import { withRouter } from "../../../stories/decorators";

const { failures } = healthFor("wf-openhie", "7");

const meta: Meta<typeof TriageTable> = {
  title: "Projects/Health/TriageTable",
  component: TriageTable,
  decorators: [withRouter],
  args: {
    signatures: failures.signatures,
    emptyMessage: "No failures in the last 7 days",
    projectId: "p1",
    workflowId: "wf-openhie",
    from: failures.window.from,
  },
};
export default meta;
type Story = StoryObj<typeof TriageTable>;

export const Default: Story = {};
export const Empty: Story = { args: { signatures: [] } };
