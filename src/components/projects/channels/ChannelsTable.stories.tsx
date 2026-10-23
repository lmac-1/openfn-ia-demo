import type { Meta, StoryObj } from "@storybook/react";
import ChannelsTable from "./ChannelsTable";
import { channelsIn } from "../../../mock-data/channels";
import { projects } from "../../../mock-data/projects";
import { withRouter } from "../../../stories/decorators";
import type { ChannelRow } from "../../../types/channels";
import { channelProxyUrl } from "../../../utils/urls";

const project = projects[0]!;
const rows: ChannelRow[] = channelsIn(project.id).map((c) => ({
  ...c,
  proxyUrl: channelProxyUrl(c.id),
  logsHref: `/projects/${project.id}/history/channels?filters[channel_id]=${c.id}`,
}));

const meta: Meta<typeof ChannelsTable> = {
  title: "Projects/Channels/ChannelsTable",
  component: ChannelsTable,
  decorators: [withRouter],
  args: { channels: rows },
};
export default meta;
type Story = StoryObj<typeof ChannelsTable>;

export const Default: Story = {};
export const ReadOnly: Story = { args: { canEdit: false, canDelete: false } };
export const Empty: Story = { args: { channels: [] } };
