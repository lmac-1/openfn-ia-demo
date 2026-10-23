import type { Meta, StoryObj } from "@storybook/react";
import { dataclips } from "../../mock-data/history";
import { withCanvas } from "../../stories/decorators";
import JsonViewer from "./JsonViewer";

const meta = {
  title: "History/JsonViewer",
  component: JsonViewer,
  decorators: [withCanvas("h-96")],
} satisfies Meta<typeof JsonViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HttpRequest: Story = { args: { value: dataclips[0]!.body } };
export const StepResult: Story = { args: { value: dataclips[1]!.body } };
export const Empty: Story = { args: { value: {} } };
/** About 3 MB, 200,000 lines: a bulk sync's step input. */
export const LargeDataclip: Story = {
  args: {
    value: {
      data: Array.from({ length: 22_000 }, (_, i) => ({ id: i, name: `Patient ${i}`, active: i % 2 === 0, visits: [i, i + 1] })),
    },
  },
};
