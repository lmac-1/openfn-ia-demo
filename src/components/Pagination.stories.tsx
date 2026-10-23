import type { Meta, StoryObj } from "@storybook/react";
import Pagination from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Shared/Pagination",
  component: Pagination,
  args: { page: { number: 1, size: 10, totalEntries: 1 } },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const OnePage: Story = {};
export const ManyPages: Story = { args: { page: { number: 2, size: 10, totalEntries: 47 } } };
export const SkipsPages: Story = { args: { page: { number: 10, size: 10, totalEntries: 200 } } };
export const NoResults: Story = { args: { page: { number: 1, size: 10, totalEntries: 0 } } };
