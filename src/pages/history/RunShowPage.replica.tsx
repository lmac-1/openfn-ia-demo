import { useParams, useSearchParams } from "react-router-dom";
import { findDataclip, findRun, findWorkOrder, stepsOf } from "../../mock-data/history";
import { finalDataclipIdOf, logsOf } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import { findUser } from "../../mock-data/users";
import { usePermissions } from "../../session/session";
import type { RunDetail, RunStep, StepDataclip } from "../../types/history";
import { capitalize } from "../../utils/format";
import RunShowPage from "./RunShowPage";

/**
 * The replica's side of RunShowPage: the run, its steps, dataclips and logs
 * from the fixtures, which are all on the current workflow version. Cancel
 * and the log level are accepted and forgotten. Lightning replaces this
 * file with a LiveView wrapper.
 */
export default function RunShowPageReplica() {
  const { projectId = "", runId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const project = findProject(projectId);
  const { canRunWorkflow, canEditDataRetention } = usePermissions(project);
  const run = findRun(runId);
  const workOrder = run && findWorkOrder(run.workOrderId);
  const selectedStepId = searchParams.get("step");
  const steps: RunStep[] = run ? stepsOf(run).map((s) => ({ ...s, insertedAt: s.startedAt, snapshotLockVersion: 1 })) : [];
  const selectedStep = steps.find((s) => s.id === selectedStepId);

  const detail: RunDetail | null =
    run && workOrder
      ? {
          id: run.id,
          workOrderId: run.workOrderId,
          state: run.state,
          startedBy: run.createdBy
            ? (findUser(run.createdBy)?.email ?? null)
            : run.startingTrigger
              ? `${capitalize(run.startingTrigger.toLowerCase())} trigger`
              : null,
          insertedAt: run.insertedAt,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          finalDataclipId: finalDataclipIdOf(run),
          snapshot: { id: `snap-${run.id}`, lockVersion: 1, insertedAt: run.insertedAt },
        }
      : null;

  const stepDataclip = (id: string | null | undefined): StepDataclip | null => {
    const dc = findDataclip(id ?? undefined);
    return dc ? { id: dc.id, wiped: dc.wiped, body: dc.body } : null;
  };

  return (
    <RunShowPage
      project={project ?? { id: projectId, parentId: null, color: null }}
      projectLabel={project?.name ?? projectId}
      runId={runId}
      loading={false}
      run={detail}
      workflow={workOrder ? { id: workOrder.workflowId, name: workOrder.workflowName, lockVersion: 1 } : null}
      steps={steps}
      selectedStepId={selectedStepId}
      inputDataclip={stepDataclip(selectedStep?.inputDataclipId)}
      outputDataclip={stepDataclip(selectedStep?.outputDataclipId)}
      logs={run ? logsOf(run) : []}
      logLevel="info"
      experimentalFeatures={false}
      canRunWorkflow={canRunWorkflow}
      canEditDataRetention={canEditDataRetention}
      adminContacts={[]}
      onCancel={() => Promise.resolve()}
      onLogLevelChange={() => {}}
    />
  );
}
