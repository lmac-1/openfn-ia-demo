import type { Meta, StoryObj } from "@storybook/react";
import ProjectSetupPanel from "./ProjectSetupPanel";
import { projects } from "../../mock-data/projects";
import { withRouter, withGrayPanel } from "../../stories/decorators";

const meta: Meta<typeof ProjectSetupPanel> = {
  title: "Project settings/ProjectSetupPanel",
  component: ProjectSetupPanel,
  decorators: [withRouter, withGrayPanel],
  args: { project: projects[0]!, env: "main", canEditProject: true, canDeleteProject: true, onUpdate: async () => {} },
};
export default meta;
type Story = StoryObj<typeof ProjectSetupPanel>;

export const Owner: Story = {};
export const ReadOnly: Story = { args: { canEditProject: false, canDeleteProject: false } };
export const Sandbox: Story = { args: { project: projects[2]!, parentProject: projects[0]! } };
/** A failed save: the form keeps its changes and shows the message above Save. */
export const SaveFailed: Story = {
  args: { onUpdate: () => Promise.reject(new Error("The server could not complete that request.")) },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>("#project-concurrency-switch")?.click();
    await new Promise((r) => setTimeout(r));
    canvasElement.querySelector<HTMLButtonElement>("#project-concurrency-submit-btn")?.click();
  },
};
