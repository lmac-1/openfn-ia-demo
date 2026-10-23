import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ChannelFormModal from "../../components/projects/channels/ChannelFormModal";
import ChannelMetrics from "../../components/projects/channels/ChannelMetrics";
import ChannelsTable from "../../components/projects/channels/ChannelsTable";
import TableTitle from "../../components/TableTitle";
import { useToast } from "../../components/Toast";
import { useRouter } from "../../routing/router";
import type { ChannelForm, ChannelFormValues, ChannelRow } from "../../types/channels";
import type { CurrentProject } from "../../types/projects";
import { errorMessage } from "../../utils/errors";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface ChannelsIndexPageProps {
  project: CurrentProject;
  /** The picker's label, "parent/child" for a sandbox. */
  projectLabel: string;
  channels: ChannelRow[];
  totalChannels: number;
  totalRequests: number;
  /** The project's channel logs ("View all"). */
  logsHref: string;
  canCreateChannel: boolean;
  canEditChannel: boolean;
  canDeleteChannel: boolean;
  /** The New / Edit Channel form while the route has it open (/channels/new, /channels/:id/edit); null on the list. */
  form: ChannelForm | null;
  /** Switches a channel on or off. Resolves when the host has answered; the host announces the result. */
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  /** Deletes a channel, after the page has asked the user to confirm. */
  onDelete: (id: string) => Promise<void>;
  /** Saves the open form. Rejects with field errors or a message, which keep it open. */
  onSave: (values: ChannelFormValues) => Promise<void>;
}

/**
 * Inventory view `channels-index` (ChannelLive.Index): stats, the channels
 * table, and the New / Edit Channel modal. Props only, so it can run
 * unchanged in Lightning; the replica's data and toasts live in
 * ChannelsIndexPage.replica.tsx. The page moves between the list and the
 * form through its routes, and the host answers with `form`.
 */
export default function ChannelsIndexPage({
  project,
  projectLabel,
  channels,
  totalChannels,
  totalRequests,
  logsHref,
  canCreateChannel,
  canEditChannel,
  canDeleteChannel,
  form,
  onToggle,
  onDelete,
  onSave,
}: ChannelsIndexPageProps) {
  const { navigate } = useRouter();
  const toast = useToast();
  const base = `/projects/${project.id}/channels`;
  const pageTitle = form ? (form.channel ? "Edit Channel" : "New Channel") : "Channels";
  // The host announces success (its flash); a refusal or a lost connection is said here.
  const failed = (error: unknown) => toast(errorMessage(error), "error");

  return (
    <>
      <PageContent header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} label={projectLabel} current={pageTitle} />} />}>
        <Centered>
          <ChannelMetrics totalChannels={totalChannels} totalRequests={totalRequests} logsHref={logsHref} />
          <TableTitle title="Channels" count={channels.length} className="mt-14">
            <Button
              id="new-channel-button"
              disabled={!canCreateChannel}
              tooltip={canCreateChannel ? undefined : "You are not authorized to perform this action."}
              onClick={() => navigate(`${base}/new`)}
            >
              New Channel
            </Button>
          </TableTitle>
          <ChannelsTable
            channels={channels}
            canEdit={canEditChannel}
            canDelete={canDeleteChannel}
            onToggle={(id, v) => void onToggle(id, v).catch(failed)}
            onEdit={(id) => navigate(`${base}/${id}/edit`)}
            onDelete={onDelete}
          />
        </Centered>
      </PageContent>
      {form && (
        <ChannelFormModal
          key={form.channel?.id ?? "new"}
          form={form}
          settingsHref={`/projects/${project.id}/settings`}
          // Replace, so Back doesn't reopen the form.
          onClose={() => navigate(base, { replace: true })}
          onSave={onSave}
        />
      )}
    </>
  );
}
