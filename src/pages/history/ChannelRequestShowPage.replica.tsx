import { Navigate, useParams } from "react-router-dom";
import { findChannel } from "../../mock-data/channels";
import { findChannelRequest } from "../../mock-data/channel-requests";
import { findProject } from "../../mock-data/projects";
import { findUser } from "../../mock-data/users";
import { usePermissions } from "../../session/session";
import ChannelRequestShowPage from "./ChannelRequestShowPage";

/**
 * The replica's side of ChannelRequestShowPage: the request, its channel and
 * the project from the fixtures, the viewer's permission, and the admin
 * emails the wiped notice names. Lightning sends a request that isn't the
 * project's back to History; so does this. Lightning replaces this file
 * with a LiveView wrapper.
 */
export default function ChannelRequestShowPageReplica() {
  const { projectId = "", requestId } = useParams();
  const project = findProject(projectId);
  const { canEditDataRetention } = usePermissions(project);
  const request = findChannelRequest(requestId);
  const channel = request && findChannel(request.channelId);

  if (!project || !request || !channel || request.projectId !== project.id) {
    return <Navigate to={`/projects/${projectId}/history`} replace />;
  }

  const adminContacts = project.members
    .filter((m) => m.role === "admin" || m.role === "owner")
    .flatMap((m) => findUser(m.userId)?.email ?? []);

  return (
    <ChannelRequestShowPage
      project={project}
      projectLabel={project.name}
      request={request}
      channel={channel}
      canEditDataRetention={canEditDataRetention}
      adminContacts={canEditDataRetention ? [] : adminContacts}
    />
  );
}
