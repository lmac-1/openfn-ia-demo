import { useState } from "react";
import type { ChannelRow } from "../../../types/channels";
import { cn } from "../../../utils/cn";
import Button from "../../Button";
import ConfirmModal from "../../ConfirmModal";
import { EmptyState, Table, Td, Th, Tr } from "../../Table";
import Toggle from "../../Toggle";
import DateTime from "../../DateTime";
import TextLink from "../../TextLink";
import ProxyUrlCopy from "./ProxyUrlCopy";

/**
 * The channels table (ChannelLive.Index `channels_table`): name, destination
 * with the copyable proxy URL under it, request count and last activity
 * (both link to the channel's logs), the Enabled toggle (text for those who
 * cannot edit), and Edit / Delete. Delete asks first in a modal, where
 * Lightning used a browser `data-confirm`.
 */
export default function ChannelsTable({
  channels,
  canEdit = true,
  canDelete = true,
  onToggle,
  onEdit,
  onDelete,
}: {
  channels: ChannelRow[];
  canEdit?: boolean;
  canDelete?: boolean;
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  /** May be async: the modal shows pending until it settles. */
  onDelete?: (id: string) => void | Promise<void>;
}) {
  const [deleting, setDeleting] = useState<ChannelRow | null>(null);

  if (channels.length === 0) return <EmptyState variant="plain" message="No channels found." />;

  return (
    <>
      <Table
        id="channels-table"
        header={
          <Tr>
            <Th>Name</Th>
            <Th>Destination</Th>
            <Th>Requests</Th>
            <Th>Last Activity</Th>
            <Th>Enabled</Th>
            <Th actions />
          </Tr>
        }
      >
        {channels.map((channel) => (
          <Tr key={channel.id} id={`channel-${channel.id}`}>
            <Td className={cn("max-w-60 font-medium wrap-break-word", channel.enabled ? "text-gray-900" : "text-gray-400")}>
              {channel.name}
            </Td>
            <Td className="max-w-80">
              <div className="flex items-center gap-1.5 font-mono text-gray-600">
                <span className="hero-arrow-right-start-on-rectangle h-4 w-4 shrink-0 text-gray-400" />
                <span className="min-w-0 wrap-break-word">{channel.destinationUrl}</span>
              </div>
              <ProxyUrlCopy url={channel.proxyUrl} icon className="mt-1" />
            </Td>
            <Td>
              <TextLink to={channel.logsHref}>{channel.requestCount}</TextLink>
            </Td>
            <Td>
              <TextLink to={channel.logsHref}>
                {channel.lastActivityAt ? <DateTime value={channel.lastActivityAt} /> : <span className="italic">Never</span>}
              </TextLink>
            </Td>
            <Td>
              {canEdit ? (
                <Toggle
                  id={channel.id}
                  name="channel_state"
                  checked={channel.enabled}
                  onChange={(v) => onToggle?.(channel.id, v)}
                  tooltip={channel.enabled ? undefined : `${channel.name} (disabled)`}
                />
              ) : (
                <span className={channel.enabled ? "text-gray-700" : "text-gray-400"}>
                  {channel.enabled ? "Enabled" : "Disabled"}
                </span>
              )}
            </Td>
            <Td actions>
              {canEdit && (
                <Button theme="secondary" size="xs" onClick={() => onEdit?.(channel.id)}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button theme="danger" size="xs" onClick={() => setDeleting(channel)}>
                  Delete
                </Button>
              )}
            </Td>
          </Tr>
        ))}
      </Table>
      {deleting && (
        <ConfirmModal
          open
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await onDelete?.(deleting.id);
            setDeleting(null);
          }}
          title="Delete channel"
          confirmLabel="Delete"
          tone="danger"
        >
          <p>{`Delete "${deleting.name}"? This cannot be undone.`}</p>
        </ConfirmModal>
      )}
    </>
  );
}
