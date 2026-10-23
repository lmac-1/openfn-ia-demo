import type { Meta, StoryObj } from "@storybook/react";
import { Link, useRouter } from "./router";
import { withRouterAt } from "../stories/decorators";

/** Shows where the router is, so you can see each click navigate. */
function Here() {
  const { pathname, search, hash } = useRouter().useLocation();
  return <p className="mb-4 font-mono text-xs text-gray-500">At {`${pathname}${search}${hash}`}</p>;
}

const meta: Meta<typeof Link> = {
  title: "Routing/Link",
  component: Link,
  decorators: [withRouterAt("/projects")],
  args: { to: "/profile", className: "link", children: "Your profile" },
  render: (args) => (
    <>
      <Here />
      <Link {...args} />
    </>
  ),
};
export default meta;
type Story = StoryObj<typeof Link>;

export const InApp: Story = {};
/** A link to the current URL replaces the history entry instead of adding one. */
export const CurrentPage: Story = { args: { to: "/projects", children: "Projects (you are here)" } };
export const Hash: Story = { args: { to: "#credentials", children: "Credentials tab" } };
export const Query: Story = { args: { to: "?filters[status]=failed", children: "Failed only" } };
/** `target` other than `_self` goes to the browser, so this opens a new tab. */
export const NewTab: Story = { args: { target: "_blank", children: "Your profile, in a new tab" } };
