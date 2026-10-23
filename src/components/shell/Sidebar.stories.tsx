import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";
import { projects } from "../../mock-data/projects";
import { session, users } from "../../mock-data/users";
import { withRouterAt } from "../../stories/decorators";

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  args: {
    collapsed: false,
    canAccessAdmin: true,
    user: session.user,
    adminEmail: session.instance.adminEmail,
    releaseLabel: session.instance.releaseLabel,
    onToggle: () => {},
  },
  decorators: [(Story) => <div className="h-[700px] flex">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const ProjectMenu: Story = {
  args: { variant: "project", project: projects[0]! },
  decorators: [withRouterAt(`/projects/${projects[0]!.id}/history`)],
};
export const ProfileMenu: Story = { args: { variant: "profile" }, decorators: [withRouterAt("/profile")] };
export const AdminMenu: Story = {
  args: { variant: "admin", theme: "sudo-variant" },
  decorators: [withRouterAt("/settings/users")],
};
export const Collapsed: Story = {
  args: { variant: "project", project: projects[0]!, collapsed: true },
  decorators: [withRouterAt(`/projects/${projects[0]!.id}/w`)],
};
/** A regular user sees Documentation, Community and Support in place of the Admin menu. */
export const RegularUser: Story = {
  args: { variant: "profile", canAccessAdmin: false },
  decorators: [withRouterAt("/profile")],
};
/** Experimental features add an item above the logo and a notice in the account menu. */
export const ExperimentalFeaturesOn: Story = {
  args: { variant: "profile", user: users[3]! },
  decorators: [withRouterAt("/profile")],
};
