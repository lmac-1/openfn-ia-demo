import type { Meta, StoryObj } from "@storybook/react";
import { withCanvas } from "../stories/decorators";
import CodeViewer from "./CodeViewer";

const meta = {
  title: "Shared/CodeViewer",
  component: CodeViewer,
  decorators: [withCanvas("h-96")],
} satisfies Meta<typeof CodeViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

const log = Array.from({ length: 40 }, (_, i) => `${i % 3 ? "JOB" : "R/T"} Line ${i + 1}`).join("\n");

export const Plain: Story = { args: { ariaLabel: "Text", value: "line one\nline two\n  indented line three" } };
export const Json: Story = {
  args: { ariaLabel: "Dataclip", language: "json", value: JSON.stringify({ data: { id: 1, tags: ["a", "b"], ok: true, note: null } }, null, 2) },
};
export const LogWithHighlight: Story = {
  args: { ariaLabel: "Run log", language: "openFnLogs", value: log, highlighted: [{ start: 20, end: 26 }], revealLine: 20 },
};
/** 50,000 lines: Monaco only draws the ones in view. */
export const LongLog: Story = {
  args: {
    ariaLabel: "Run log",
    language: "openFnLogs",
    value: Array.from({ length: 50_000 }, (_, i) => `JOB Line ${i + 1}`).join("\n"),
    highlighted: [{ start: 40_000, end: 40_010 }],
    revealLine: 40_000,
  },
};
