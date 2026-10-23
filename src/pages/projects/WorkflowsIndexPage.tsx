import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ProjectMetrics from "../../components/projects/ProjectMetrics";
import WorkflowsHeader from "../../components/projects/WorkflowsHeader";
import WorkflowsTable from "../../components/projects/WorkflowsTable";
import { useToast } from "../../components/Toast";
import type { CurrentProject } from "../../types/projects";
import type { SortState } from "../../types/lists";
import type { ProjectMetrics as Metrics, WorkflowRow } from "../../types/workflows";
import { errorMessage } from "../../utils/errors";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface WorkflowsIndexPageProps {
  project: CurrentProject;
  /** The picker's label, "parent/child" for a sandbox. */
  projectLabel: string;
  /** The window the numbers cover, e.g. "last 30 days". */
  period: string;
  /** The workflows after search and sort, as the server lists them. */
  stats: WorkflowRow[];
  /** The four cards' numbers, aggregated by the server. */
  metrics: Metrics;
  /** History links behind the Work Orders card's "pending" and the failed card's "View all". */
  pendingHref?: string | undefined;
  failedHref?: string | undefined;
  /** The current search (`?q`). */
  searchTerm: string;
  /** The order the server listed `stats` in (`?sort`, `?dir`). */
  sort: SortState;
  canCreateWorkflow: boolean;
  canDeleteWorkflow: boolean;
  /** The experimental workflow lifecycle: state badges instead of switches outside a sandbox. */
  lifecycle?: boolean;
  /** Searches; the host narrows the list and the URL. */
  onSearch: (term: string) => void;
  /** Clears the search. */
  onClear: () => void;
  /** Switches a workflow on or off. Resolves when the host has answered; the host announces the result. */
  onToggle: (workflowId: string, enabled: boolean) => Promise<void>;
  /** Deletes a workflow, after the page has asked the user to confirm. */
  onDelete: (workflowId: string) => Promise<void>;
}

/**
 * Inventory view `workflows-index` (WorkflowLive.Index): search, the four
 * metric cards, and the workflows table. Props only, so it can run unchanged
 * in Lightning; the replica's data and toasts live in
 * WorkflowsIndexPage.replica.tsx.
 */
export default function WorkflowsIndexPage({
  project,
  projectLabel,
  period,
  stats,
  metrics,
  pendingHref,
  failedHref,
  searchTerm,
  sort,
  canCreateWorkflow,
  canDeleteWorkflow,
  lifecycle = false,
  onSearch,
  onClear,
  onToggle,
  onDelete,
}: WorkflowsIndexPageProps) {
  const toast = useToast();
  // The host announces success (its flash); a refusal or a lost connection is said here.
  const failed = (error: unknown) => toast(errorMessage(error), "error");
  return (
    <PageContent header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} label={projectLabel} />} />}>
      <Centered>
        <WorkflowsHeader
          count={stats.length}
          projectId={project.id}
          canCreate={canCreateWorkflow}
          searchTerm={searchTerm}
          onSearch={onSearch}
          onClear={onClear}
        />
        <ProjectMetrics metrics={metrics} projectId={project.id} pendingHref={pendingHref} failedHref={failedHref} />
        <div className="mt-8">
          <WorkflowsTable
            stats={stats}
            projectId={project.id}
            searchTerm={searchTerm}
            canDelete={canDeleteWorkflow}
            period={period}
            lifecycle={lifecycle}
            isSandbox={project.parentId !== null}
            sort={sort}
            onToggle={(id, v) => void onToggle(id, v).catch(failed)}
            onDelete={(id) => void onDelete(id).catch(failed)}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
