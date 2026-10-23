import type { Meta, StoryObj } from "@storybook/react";
import CreateProjectModal from "./CreateProjectModal";
import { RequestError } from "../../utils/errors";

const meta: Meta<typeof CreateProjectModal> = {
  title: "Projects/CreateProjectModal",
  component: CreateProjectModal,
  args: { open: true, onClose: () => {}, onCreate: async () => {} },
};
export default meta;
type Story = StoryObj<typeof CreateProjectModal>;

export const Open: Story = {};

/** The server rejects the name: the modal stays open and the message shows on the Name field. */
export const ServerFieldError: Story = {
  args: {
    onCreate: () => Promise.reject(new RequestError("Invalid project", { fieldErrors: { rawName: ["has already been taken"] } })),
  },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const input = doc.querySelector<HTMLInputElement>("#project_raw_name")!;
    // Set the value the way a keystroke does, so React's onChange sees it.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "openhie-project");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r));
    doc.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
  },
};

/** The server's error is keyed `name`, which isn't a form field: it shows as an Alert in the modal instead. */
export const ServerErrorOnOtherField: Story = {
  args: {
    onCreate: () =>
      Promise.reject(new RequestError("Name has already been taken", { fieldErrors: { name: ["has already been taken"] } })),
  },
  play: ServerFieldError.play!,
};
