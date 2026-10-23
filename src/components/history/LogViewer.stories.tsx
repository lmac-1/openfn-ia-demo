import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { runLogs } from "../../mock-data/history";
import { withCanvas } from "../../stories/decorators";
import type { LogLine } from "../../types/history";
import LogViewer from "./LogViewer";

const meta = {
  title: "History/LogViewer",
  component: LogViewer,
  decorators: [(Story) => <div className="flex h-full">{Story()}</div>, withCanvas("h-96")],
} satisfies Meta<typeof LogViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

const syntheticLine = (i: number): LogLine => ({
  timestamp: "09:12:01.004",
  source: i % 4 ? "JOB" : "R/T",
  level: i % 10 ? "info" : "debug",
  message: i % 50 ? `Processed record ${i + 1}` : JSON.stringify({ record: i + 1, ok: true }),
  stepId: i < 25_000 ? "step-a" : "step-b",
});

export const Default: Story = { args: { logs: runLogs["run-1"]!, finished: true } };
export const StepSelected: Story = { args: { logs: runLogs["run-1"]!, finished: true, selectedStepId: "step-1b" } };
export const Errors: Story = { args: { logs: runLogs["run-2"]!, finished: true, defaultLevel: "error" } };
export const Waiting: Story = { args: { logs: [], finished: false, waitingMessage: "Waiting for worker" } };
export const NoLogs: Story = { args: { logs: [], finished: true } };
/** 50,000 lines with the second step selected: it scrolls to that step's first line. */
export const LongLog: Story = {
  args: { logs: Array.from({ length: 50_000 }, (_, i) => syntheticLine(i)), finished: true, selectedStepId: "step-b" },
};

function StreamingLog() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  useEffect(() => {
    const t = setInterval(() => setLogs((l) => [...l, ...Array.from({ length: 20 }, (_, i) => syntheticLine(l.length + i))]), 500);
    return () => clearInterval(t);
  }, []);
  return <LogViewer logs={logs} finished={false} selectedStepId="step-a" />;
}

/** Twenty lines every half second, appended to the model rather than redrawn. */
export const Streaming: Story = { args: { logs: [], finished: false }, render: () => <StreamingLog /> };
