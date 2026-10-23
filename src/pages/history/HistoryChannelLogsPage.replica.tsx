import { Navigate, useParams } from "react-router-dom";
import { channelRequestsIn } from "../../mock-data/channel-requests";
import { channelsIn } from "../../mock-data/channels";
import { historyChannelsEnabled } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import type { ChannelLogRow } from "../../types/channels";
import { useUrlParams } from "../../utils/useUrlParams";
import HistoryChannelLogsPage from "./HistoryChannelLogsPage";

const PAGE_SIZE = 10;

/**
 * The replica's side of HistoryChannelLogsPage: the fixtures as rows, the
 * channel filter and the page read from the URL, ten rows a page as
 * Lightning paginates. Lightning replaces this file with a LiveView wrapper.
 */
export default function HistoryChannelLogsPageReplica() {
  const { projectId = "" } = useParams();
  const { params } = useUrlParams();
  const project = findProject(projectId);
  if (!project) return <Navigate to="/projects" replace />;

  const channels = channelsIn(projectId);
  const channelId = params["filters[channel_id]"] ?? null;
  const pageNumber = Math.max(1, Number(params["page"] ?? "1") || 1);
  const all = channelRequestsIn(projectId)
    .filter((r) => !channelId || r.channelId === channelId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const rows: ChannelLogRow[] = all.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE).map((r) => ({
    id: r.id,
    requestId: r.requestId,
    channelId: r.channelId,
    channelName: channels.find((c) => c.id === r.channelId)?.name ?? "",
    startedAt: r.startedAt,
    state: r.state,
    requestPath: r.events.find((e) => e.type === "destination_response")?.requestPath ?? null,
    errorMessage: r.events.find((e) => e.type === "error")?.errorMessage ?? null,
  }));

  return (
    <HistoryChannelLogsPage
      project={project}
      projectLabel={project.name}
      channelsEnabled={historyChannelsEnabled}
      channels={channels.map(({ id, name }) => ({ id, name }))}
      channelId={channelId}
      rows={rows}
      page={{ number: pageNumber, size: PAGE_SIZE, totalEntries: all.length }}
    />
  );
}
