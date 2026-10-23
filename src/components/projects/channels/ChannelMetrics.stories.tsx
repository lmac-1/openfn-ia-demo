import type { Meta, StoryObj } from "@storybook/react";
import ChannelMetrics from "./ChannelMetrics";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";

const meta: Meta<typeof ChannelMetrics> = {
  title: "Projects/Channels/ChannelMetrics",
  component: ChannelMetrics,
  decorators: [withRouter],
  args: { totalChannels: 2, totalRequests: 3421, logsHref: `/projects/${projects[0]!.id}/history/channels` },
};
export default meta;
type Story = StoryObj<typeof ChannelMetrics>;

export const Default: Story = {};
export const Empty: Story = { args: { totalChannels: 0, totalRequests: 0 } };
