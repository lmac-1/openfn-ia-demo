import type { Meta, StoryObj } from "@storybook/react";
import VolumeBars from "./VolumeBars";
import { healthFor } from "../../../mock-data/workflow-health";
import { withRouter, withWhitePanel } from "../../../stories/decorators";

const week = healthFor("wf-openhie", "7").runs;
const month = healthFor("wf-openhie", "30").runs;
const day = healthFor("wf-openhie", "1").runs;

const meta: Meta<typeof VolumeBars> = {
  title: "Projects/Health/VolumeBars",
  component: VolumeBars,
  decorators: [withRouter, withWhitePanel("w-3xl")],
  args: {
    buckets: week.buckets,
    hours: week.bucket_hours,
    timezone: week.timezone,
    emptyMessage: "No runs in the last 7 days",
    projectId: "p1",
    workflowId: "wf-openhie",
  },
};
export default meta;
type Story = StoryObj<typeof VolumeBars>;

export const SevenDays: Story = {};
export const ThirtyDays: Story = { args: { buckets: month.buckets, hours: month.bucket_hours } };
export const TwentyFourHours: Story = { args: { buckets: day.buckets, hours: day.bucket_hours } };
export const Empty: Story = { args: { buckets: [] } };
