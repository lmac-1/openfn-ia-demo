import { useCallback, useState } from "react";
// eslint-disable-next-line no-restricted-imports -- demo layout: reads route params and renders the route Outlet.
import { Outlet, useLocation, useParams } from "react-router-dom";
// eslint-disable-next-line no-restricted-imports -- wiring: the layout route loads the project in the URL and the picker's project tree.
import { findProject, projects } from "../../mock-data/projects";
import { useCurrentUser, useInstanceInfo, usePermissions } from "../../session/session";
import Sidebar, { type SidebarVariant } from "./Sidebar";
import Picker from "./Picker";
import { buildProjectPickerItems } from "./projectPickerItems";

/**
 * Lightning's logged-in layout (layouts/live.html.heex, settings.html.heex):
 * the side menu, the page, and the global project picker. Admin routes
 * (/settings/*) get the gray admin menu; project routes the project menu.
 */
export default function AppShell() {
  const { pathname } = useLocation();
  const { projectId } = useParams();
  const project = findProject(projectId);
  const user = useCurrentUser();
  const { adminEmail, releaseLabel } = useInstanceInfo();
  const { canAccessAdmin } = usePermissions(project);
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const variant: SidebarVariant = pathname.startsWith("/settings")
    ? "admin"
    : project
      ? "project"
      : "profile";

  return (
    <main className="flex h-screen">
      <Sidebar
        variant={variant}
        project={project}
        user={user}
        canAccessAdmin={canAccessAdmin}
        adminEmail={adminEmail}
        releaseLabel={releaseLabel}
        theme={variant === "admin" ? "sudo-variant" : "primary-theme"}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <div className="min-w-0 flex-auto">
        <Outlet />
      </div>
      <Picker
        items={buildProjectPickerItems(pathname, projects)}
        currentId={project?.id}
        placeholder="Search projects..."
        emptyMessage="No projects found"
        viewAllLabel="View all projects"
        viewAllHref="/projects"
        openEvent="open-project-picker"
      />
    </main>
  );
}
