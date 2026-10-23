import type { Meta, StoryObj } from "@storybook/react";
import DateTime from "./DateTime";

const meta = { title: "Shared/DateTime", component: DateTime } satisfies Meta<typeof DateTime>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Relative: Story = { args: { value: "2026-10-14T08:30:00Z" } };
export const RelativeDetailed: Story = { args: { value: "2026-10-14T08:30:07Z", format: "relative_detailed" } };
export const TimeOnly: Story = { args: { value: "2026-10-14T09:12:00Z", format: "time_only" } };
export const Empty: Story = { args: { value: null } };
export const Milliseconds: Story = { args: { value: "2026-10-14T08:30:07.123456Z" } };
export const OtherYear: Story = { args: { value: "2024-03-05T08:30:00Z" } };
