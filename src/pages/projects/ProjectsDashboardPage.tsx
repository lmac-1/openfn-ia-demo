import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import ProjectsTable from "../../components/projects/ProjectsTable";
import WelcomeBanner from "../../components/projects/WelcomeBanner";
import type { ProjectOverview } from "../../types/workflows";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface ProjectsDashboardPageProps {
  /** The signed-in user's first name, for the greeting. */
  firstName: string;
  /** The user's projects with their counts, as the server lists them; the table sorts them. */
  projects: ProjectOverview[];
  /**
   * Creates a project. Rejects on failure; field errors keyed `rawName` and
   * `description` show on the form. The host announces success.
   */
  onCreate: (project: { name: string; description: string }) => Promise<void>;
}

/**
 * Inventory view `projects-dashboard` (DashboardLive.Index): the greeting,
 * the user's projects, and the Create project modal. Props only, so it can
 * run unchanged in Lightning; the replica's data and toasts live in
 * ProjectsDashboardPage.replica.tsx.
 */
export default function ProjectsDashboardPage({ firstName, projects, onCreate }: ProjectsDashboardPageProps) {
  const [creating, setCreating] = useState(false);

  return (
    <PageContent header={<Header title="Projects" />}>
      <Centered>
        <div className="-mt-6">
          <WelcomeBanner firstName={firstName} />
          <div id="user-projects-section">
            <ProjectsTable
              projects={projects}
              onCreate={() => setCreating(true)}
              createButton={
                <Button id="open-create-project-modal-button" className="w-full" onClick={() => setCreating(true)}>
                  Create project
                </Button>
              }
            />
          </div>
          <CreateProjectModal open={creating} onClose={() => setCreating(false)} onCreate={onCreate} />
        </div>
      </Centered>
    </PageContent>
  );
}
