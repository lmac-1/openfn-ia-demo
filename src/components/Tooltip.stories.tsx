import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import Tooltip from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Shared/Tooltip",
  component: Tooltip,
  args: { content: "Save changes", children: <Button>Save</Button> },
  decorators: [(Story) => <div className="p-12"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};
export const Top: Story = { args: { side: "top" } };
/** Click to copy; the tooltip says "Copied!" for 1.5 seconds. */
export const Copy: Story = {
  args: {
    side: "top",
    copy: "2026-10-14 08:30:07 UTC",
    content: (
      <>
        2026-10-14 08:30:07 UTC
        <span className="block text-xs text-gray-400">Click to copy timestamp</span>
      </>
    ),
    children: <span className="cursor-pointer">today at 8:30:07 AM</span>,
  },
};
