import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { projectLabel } from "../../components/shell/projectPickerItems";
import { findProject, projects } from "../../mock-data/projects";
import { findWorkflow } from "../../mock-data/workflows";
import { healthFor } from "../../mock-data/workflow-health";
import { DEFAULT_HEALTH_DAYS } from "../../constants";
import type { HealthRange } from "../../types/workflow-health";
import WorkflowHealthPage from "./WorkflowHealthPage";

/**
 * The replica's side of WorkflowHealthPage: the project and workflow from the
 * URL, and every panel answered at once from the fixtures. Lightning replaces
 * this file with a LiveView wrapper that polls the health endpoints.
 */
export default function WorkflowHealthPageReplica() {
  const { projectId, workflowId } = useParams();
  const project = findProject(projectId);
  const workflow = findWorkflow(workflowId);
  const [days, setDays] = useState<HealthRange["days"]>(DEFAULT_HEALTH_DAYS);
  if (!project) return <Navigate to="/projects" replace />;
  if (!workflow) return <Navigate to={`/projects/${project.id}/w`} replace />;
  const health = healthFor(workflow.id, days);

  return (
    <WorkflowHealthPage
      project={project}
      projectLabel={projectLabel(project, projects)}
      workflow={workflow}
      days={days}
      onDaysChange={setDays}
      outcomes={{ data: health.outcomes, error: null }}
      failures={{ data: health.failures, error: null }}
      runs={{ data: health.runs, error: null }}
    />
  );
}
