import type { Meta, StoryObj } from "@storybook/react";
import type { DataclipDetail } from "../../types/history";
import DataclipDetailsCard, { DataclipBodyCard } from "./DataclipDetailsCard";
import JsonViewer from "./JsonViewer";

const dataclip: DataclipDetail = {
  id: "7f3a91c2-4d8e-4b1a-9c6f-2e5d8a1b3c4d",
  type: "http_request",
  insertedAt: "2026-10-14T09:12:00Z",
  updatedAt: "2026-10-14T09:12:00Z",
  wipedAt: null,
};
const wiped: DataclipDetail = { ...dataclip, type: "step_result", wipedAt: "2026-10-20T00:00:00Z" };
const body = JSON.stringify({ data: { name: "chw-0042" }, request: { method: "POST" } }, null, 2);

const meta = { title: "History/DataclipDetailsCard", component: DataclipDetailsCard } satisfies Meta<
  typeof DataclipDetailsCard
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HttpRequest: Story = { args: { dataclip } };
export const Wiped: Story = { args: { dataclip: wiped } };

export const BodyCard: Story = {
  args: { dataclip },
  render: () => (
    <DataclipBodyCard wiped={false}>
      <JsonViewer value={body} />
    </DataclipBodyCard>
  ),
};
export const WipedBodyCard: Story = {
  args: { dataclip: wiped },
  render: () => <DataclipBodyCard wiped />,
};
