import { Navigate, useParams } from "react-router-dom";
import { findDataclip } from "../../mock-data/history";
import { dataclipUpdatedAt } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import { uuidOf } from "../../utils/format";
import DataclipShowPage from "./DataclipShowPage";

/**
 * The replica's side of DataclipShowPage: the dataclip and project from the
 * fixtures, with a UUID-shaped id as Lightning shows. Lightning flashes
 * "Dataclip not found" and sends you to History; so does this. Lightning
 * replaces this file with a LiveView wrapper.
 */
export default function DataclipShowPageReplica() {
  const { projectId = "", dataclipId = "" } = useParams();
  const project = findProject(projectId);
  const dataclip = findDataclip(dataclipId);

  if (!project || !dataclip || dataclip.projectId !== projectId) {
    return <Navigate to={`/projects/${projectId}/history`} replace />;
  }

  const updatedAt = dataclipUpdatedAt(dataclip.id) ?? dataclip.insertedAt;
  const body = typeof dataclip.body === "string" ? dataclip.body : JSON.stringify(dataclip.body, null, 2);

  return (
    <DataclipShowPage
      project={project}
      projectLabel={project.name}
      dataclip={{
        id: uuidOf(dataclip.id),
        type: dataclip.type,
        insertedAt: dataclip.insertedAt,
        updatedAt,
        wipedAt: dataclip.wiped ? updatedAt : null,
      }}
      body={dataclip.wiped ? undefined : body}
    />
  );
}
