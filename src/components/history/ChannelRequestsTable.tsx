import Pagination from "../Pagination";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import type { ChannelLogRow } from "../../types/channels";
import type { PageInfo } from "../../types/lists";
import DateTime from "../DateTime";
import TextLink from "../TextLink";
import { ChannelStatePill } from "./StatePill";
import { shortUuid } from "../../utils/format";

/** History's Channel Logs table (run_live/channel_logs_component.ex): one page of requests, newest first. */
export default function ChannelRequestsTable({
  rows,
  page,
  projectId,
}: {
  rows: ChannelLogRow[];
  page: PageInfo;
  projectId: string;
}) {
  return (
    <Table
      id="channel-requests-table"
      header={
        <Tr>
          <Th>Request ID</Th>
          <Th>Request Path</Th>
          <Th>Channel Name</Th>
          <Th>Started At</Th>
          <Th>Status</Th>
          <Th>Error Message</Th>
        </Tr>
      }
      footer={<Pagination page={page} />}
    >
      {rows.length === 0 ? (
        <Tr>
          <Td colSpan={6}>
            <EmptyState icon="hero-inbox" message="No channel requests found." />
          </Td>
        </Tr>
      ) : (
        rows.map((r) => (
          <Tr key={r.id} id={`request-${r.id}`}>
            <Td title={r.requestId}>
              <TextLink to={`/projects/${projectId}/history/channels/${r.id}`} className="font-mono">
                {shortUuid(r.requestId)}
              </TextLink>
            </Td>
            <Td className="text-gray-700">{r.requestPath || "—"}</Td>
            <Td>
              <TextLink to={`/projects/${projectId}/history/channels?filters[channel_id]=${r.channelId}`}>{r.channelName}</TextLink>
            </Td>
            <Td>
              <DateTime value={r.startedAt} />
            </Td>
            <Td>
              <ChannelStatePill state={r.state} />
            </Td>
            <Td className="max-w-xs truncate">{r.errorMessage}</Td>
          </Tr>
        ))
      )}
    </Table>
  );
}
