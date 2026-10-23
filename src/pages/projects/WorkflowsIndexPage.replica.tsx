import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { projectLabel } from "../../components/shell/projectPickerItems";
import { projectMetricsFor } from "../../utils/history";
import { workflowStatsFor } from "../../mock-data/dashboard-stats";
import { findProject, projects } from "../../mock-data/projects";
import { simulateRequest } from "../../mock-data/request";
import { permissionsFor } from "../../permissions";
import { useCurrentUser } from "../../session/session";
import { matchesQuery } from "../../utils/search";
import { useUrlParams } from "../../utils/useUrlParams";
import { compareBy, type SortValue } from "../../components/useTableSort";
import type { WorkflowRow } from "../../types/workflows";
import WorkflowsIndexPage from "./WorkflowsIndexPage";

// The columns WorkflowLive.Index sorts by; any other key sorts by name, as its TableHelpers.sort_field does.
const sortBy: Record<string, (s: WorkflowRow) => SortValue> = {
  name: (s) => s.workflow.name,
  last_workorder_updated_at: (s) => s.lastWorkOrder?.updatedAt ?? null,
  workorders_count: (s) => s.workordersCount,
  failed_workorders_count: (s) => s.failedWorkordersCount,
  enabled: (s) => s.workflow.enabled,
};

/**
 * The replica's side of WorkflowsIndexPage: the project from the URL, the
 * fixtures joined, filtered and sorted (`?sort`, `?dir`) as the server would, metrics summed from
 * them, and the success toasts. Toggle and delete only change local state.
 * Lightning replaces this file with a LiveView wrapper.
 */
export default function WorkflowsIndexPageReplica() {
  const { projectId } = useParams();
  const user = useCurrentUser();
  const project = findProject(projectId);
  const { params } = useUrlParams<"sort" | "dir">();
  const sort = { key: params.sort && params.sort in sortBy ? params.sort : "name", direction: params.dir === "desc" ? "desc" : "asc" } as const;
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const toast = useToast();

  if (!project) return <Navigate to="/projects" replace />;

  const { canCreateWorkflow, canDeleteWorkflow } = permissionsFor(project, user);
  const stats = workflowStatsFor(project.id)
    .filter((s) => !deleted.includes(s.workflow.id))
    .filter((s) => matchesQuery(search, s.workflow.name))
    .map((s) => ({ ...s, workflow: { ...s.workflow, enabled: enabled[s.workflow.id] ?? s.workflow.enabled } }))
    .sort(compareBy(sortBy[sort.key]!, sort.direction));

  return (
    <WorkflowsIndexPage
      project={project}
      projectLabel={projectLabel(project, projects)}
      period="last 30 days"
      stats={stats}
      metrics={projectMetricsFor(stats)}
      searchTerm={search}
      sort={sort}
      canCreateWorkflow={canCreateWorkflow}
      canDeleteWorkflow={canDeleteWorkflow}
      lifecycle={user.experimentalFeatures}
      onSearch={setSearch}
      onClear={() => setSearch("")}
      onToggle={async (id, v) => {
        await simulateRequest();
        setEnabled((m) => ({ ...m, [id]: v }));
        toast("Workflow updated");
      }}
      onDelete={async (id) => {
        await simulateRequest();
        setDeleted((d) => [...d, id]);
        toast("Workflow successfully deleted.");
      }}
    />
  );
}
