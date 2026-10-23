import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { projectLabel } from "../../components/shell/projectPickerItems";
import { channelsIn, findChannel, projectCredentialOptions, webhookAuthMethods } from "../../mock-data/channels";
import { findProject, projects } from "../../mock-data/projects";
import { simulateRequest } from "../../mock-data/request";
import { permissionsFor } from "../../permissions";
import { useCurrentUser } from "../../session/session";
import type { ChannelForm, ChannelRow } from "../../types/channels";
import { channelProxyUrl } from "../../utils/urls";
import ChannelsIndexPage from "./ChannelsIndexPage";

/**
 * The replica's side of ChannelsIndexPage: the project from the URL, the
 * fixtures as rows, the form for /channels/new and /channels/:channelId/edit,
 * and the success toasts. Toggle and delete only change local state; save
 * just closes. Lightning replaces this file with a LiveView wrapper.
 */
export default function ChannelsIndexPageReplica() {
  const { projectId, channelId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const project = findProject(projectId);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const toast = useToast();

  if (!project) return <Navigate to="/projects" replace />;

  const { canCreateChannel, canEditChannel, canDeleteChannel } = permissionsFor(project, user);
  const logs = `/projects/${project.id}/history/channels`;
  const channels: ChannelRow[] = channelsIn(project.id)
    .filter((c) => !deleted.includes(c.id))
    .map((c) => ({
      id: c.id,
      name: c.name,
      enabled: enabled[c.id] ?? c.enabled,
      destinationUrl: c.destinationUrl,
      proxyUrl: channelProxyUrl(c.id),
      requestCount: c.requestCount,
      lastActivityAt: c.lastActivityAt,
      logsHref: `${logs}?filters[channel_id]=${c.id}`,
    }));

  const editing = channelId ? findChannel(channelId) : undefined;
  const form: ChannelForm | null =
    pathname.endsWith("/channels/new") || editing
      ? {
          channel: editing && {
            id: editing.id,
            proxyUrl: channelProxyUrl(editing.id),
            name: editing.name,
            enabled: enabled[editing.id] ?? editing.enabled,
            destinationUrl: editing.destinationUrl,
            destinationCredentialId: editing.destinationCredentialId ?? "",
            clientAuthMethodIds: editing.clientAuthMethodIds,
          },
          credentialOptions: projectCredentialOptions,
          authMethodOptions: webhookAuthMethods,
        }
      : null;

  return (
    <ChannelsIndexPage
      project={project}
      projectLabel={projectLabel(project, projects)}
      channels={channels}
      totalChannels={channels.length}
      totalRequests={channels.reduce((sum, c) => sum + c.requestCount, 0)}
      logsHref={logs}
      canCreateChannel={canCreateChannel}
      canEditChannel={canEditChannel}
      canDeleteChannel={canDeleteChannel}
      form={form}
      onToggle={async (id, v) => {
        await simulateRequest();
        setEnabled((m) => ({ ...m, [id]: v }));
        toast("Channel updated");
      }}
      onDelete={async (id) => {
        await simulateRequest();
        setDeleted((d) => [...d, id]);
        toast("Channel deleted.");
      }}
      onSave={async () => {
        await simulateRequest();
        toast(editing ? "Channel updated successfully." : "Channel created successfully.");
        // The host owns the form's route, so it closes the form. Replace, as
        // Cancel does, so Back doesn't reopen it.
        navigate(`/projects/${project.id}/channels`, { replace: true });
      }}
    />
  );
}
