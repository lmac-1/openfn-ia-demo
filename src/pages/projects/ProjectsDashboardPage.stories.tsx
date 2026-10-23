import type { Meta, StoryObj } from "@storybook/react";
import ProjectsDashboardPage from "./ProjectsDashboardPage";
import { projectsOverviewFor } from "../../mock-data/dashboard-stats";
import { session } from "../../mock-data/users";
import { withCanvas, withRouter } from "../../stories/decorators";

const meta: Meta<typeof ProjectsDashboardPage> = {
  title: "Pages/Projects/ProjectsDashboardPage",
  component: ProjectsDashboardPage,
  // PageContent fills its parent, so give it a screen to fill.
  decorators: [withRouter, withCanvas("h-screen")],
  parameters: { layout: "fullscreen" },
  args: {
    firstName: session.user.firstName,
    projects: projectsOverviewFor(session.user.id),
    onCreate: async () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProjectsDashboardPage>;

export const WithProjects: Story = {};
export const Empty: Story = { args: { projects: [] } };
