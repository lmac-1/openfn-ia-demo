import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import SegmentedControl, { type SegmentedOption } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = { title: "Shared/SegmentedControl", component: SegmentedControl };
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

function Stateful({ options }: { options: SegmentedOption[] }) {
  const [value, setValue] = useState(options[0]!.value);
  return <SegmentedControl label="Time range" options={options} value={value} onChange={setValue} />;
}

const ranges: SegmentedOption[] = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

export const Default: Story = { render: () => <Stateful options={ranges} /> };

export const WithDisabled: Story = {
  render: () => (
    <Stateful
      options={ranges.map((r) =>
        r.value === "30" ? { ...r, disabled: true, disabledReason: "Only 14 days of history are kept for this project." } : r
      )}
    />
  ),
};
