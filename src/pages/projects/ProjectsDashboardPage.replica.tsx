import { useToast } from "../../components/Toast";
import { projectsOverviewFor } from "../../mock-data/dashboard-stats";
import { simulateRequest } from "../../mock-data/request";
import { useCurrentUser } from "../../session/session";
import ProjectsDashboardPage from "./ProjectsDashboardPage";

/**
 * The replica's side of ProjectsDashboardPage: the fixtures joined as the
 * server would, the signed-in user from the session, and the success toast.
 * Creating a project only toasts; the fixture list doesn't change. Lightning
 * replaces this file with a LiveView wrapper.
 */
export default function ProjectsDashboardPageReplica() {
  const currentUser = useCurrentUser();
  const toast = useToast();

  return (
    <ProjectsDashboardPage
      firstName={currentUser.firstName}
      projects={projectsOverviewFor(currentUser.id)}
      onCreate={async () => {
        await simulateRequest();
        toast("Project created successfully");
      }}
    />
  );
}
