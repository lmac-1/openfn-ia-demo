import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import Tabs from "../../components/Tabs";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ChannelRequestsTable from "../../components/history/ChannelRequestsTable";
import FilterChip, { FilterMenu } from "../../components/history/FilterChip";
import { useUrlParams } from "../../utils/useUrlParams";
import type { ChannelLogRow } from "../../types/channels";
import type { PageInfo } from "../../types/lists";
import type { CurrentProject } from "../../types/projects";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface HistoryChannelLogsPageProps {
  project: CurrentProject;
  /** The picker's label, "parent/child" for a sandbox. */
  projectLabel: string;
  /** Whether the Work Orders / Channel Logs tab bar shows (the viewer's experimental features). */
  channelsEnabled: boolean;
  /** The project's channels, for the filter. */
  channels: { id: string; name: string }[];
  /** The channel the list is filtered to (the URL's `filters[channel_id]`), or null for all. */
  channelId: string | null;
  /** The page of requests, newest first. */
  rows: ChannelLogRow[];
  page: PageInfo;
}

/**
 * Inventory view `history-channel-logs` (RunLive.Index :channel_logs,
 * channel_logs_component.ex): the project's channel requests, filtered by
 * channel and paginated through the URL. Props only, so it can run unchanged
 * in Lightning; the replica's data lives in HistoryChannelLogsPage.replica.tsx.
 */
export default function HistoryChannelLogsPage({ project, projectLabel, channelsEnabled, channels, channelId, rows, page }: HistoryChannelLogsPageProps) {
  const { update } = useUrlParams();
  const base = `/projects/${project.id}/history/channels`;
  const selected = channels.find((c) => c.id === channelId);
  // The filter and the page live in the URL, as the HEEx kept them; a new filter starts at page 1.
  const filter = (channel: string | null) => update({ "filters[channel_id]": channel, page: null });

  return (
    <PageContent
      header={
        <Header breadcrumbs={<ProjectBreadcrumbs project={project} label={projectLabel} current="History" />}>
          {channelsEnabled && (
            <Tabs
              variant="pill"
              label="History"
              active="channel-logs"
              tabs={[
                { id: "work-orders", label: "Work Orders", to: `/projects/${project.id}/history` },
                { id: "channel-logs", label: "Channel Logs", to: base },
              ]}
            />
          )}
        </Header>
      }
    >
      <Centered>
        <div className="mb-4">
          <FilterChip
            id="channel-filter-chip"
            active={selected !== undefined}
            onClear={() => filter(null)}
            menu={
              <FilterMenu
                options={[{ value: null, label: "All Channels" }, ...channels.map((c) => ({ value: c.id, label: c.name }))]}
                selected={selected?.id ?? null}
                onSelect={(id) => filter(id)}
              />
            }
          >
            Channel is {selected ? selected.name : "any"}
          </FilterChip>
        </div>
        <ChannelRequestsTable rows={rows} page={page} projectId={project.id} />
      </Centered>
    </PageContent>
  );
}
