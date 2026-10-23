import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import CodeEditor from "./CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Workflow/CodeEditor",
  component: CodeEditor,
  decorators: [(Story) => <div className="h-64"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CodeEditor>;

function EditableDemo() {
  const [value, setValue] = useState("fn(state => state);\n");
  return <CodeEditor value={value} onChange={setValue} />;
}

export const Editable: Story = { render: () => <EditableDemo /> };
export const ReadOnly: Story = {
  args: { value: "get('trackedEntityInstances', {\n  ou: 'DiszpKrYNg8',\n});\n", readOnly: true },
};
export const Json: Story = {
  args: { value: '{\n  "data": {\n    "resourceType": "Patient"\n  }\n}\n', language: "json", readOnly: true },
};
export const Minimap: Story = {
  args: {
    value: Array.from({ length: 40 }, (_, i) => `fn(state => {\n  // step ${i + 1}\n  return state;\n});`).join("\n"),
    options: { minimap: { enabled: true } },
  },
};
