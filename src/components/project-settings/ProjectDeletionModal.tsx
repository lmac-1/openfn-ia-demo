import ConfirmModal from "../ConfirmModal";
import type { Project } from "../../types/projects";

interface Props {
  project: Pick<Project, "name">;
  /** Days until the project is purged; 0 means "today". */
  gracePeriodDays: number;
  onCancel: () => void;
  /** Called with the typed name once it matches. May be async: the modal shows pending and stays open with the error if it rejects. */
  onDelete: (nameConfirmation: string) => void | Promise<void>;
}

/**
 * Lightning's ProjectDeletionModal (live/components/project_deletion_modal.ex),
 * opened by /projects/:id/settings/delete. The Delete button enables once
 * the typed name matches.
 */
export default function ProjectDeletionModal({ project, gracePeriodDays, onCancel, onDelete }: Props) {
  const when = gracePeriodDays > 0 ? `${gracePeriodDays} day(s) from today` : "today";

  return (
    <ConfirmModal
      open
      onClose={onCancel}
      onConfirm={onDelete}
      title="Delete project"
      confirmLabel="Delete project"
      tone="danger"
      formId="scheduled_deletion_form"
      confirmation={{
        id: "project_name_confirmation",
        label: "Project name",
        expected: project.name,
        mismatchError: "doesn't match the project name",
      }}
    >
      <p>
        Enter the project name to confirm deletion: <b>{project.name}</b>
      </p>
      <p>
        Deleting this project will disable access for all users, and disable all jobs in the project. The whole
        project will be deleted along with all workflows and work order history, {when}.
      </p>
    </ConfirmModal>
  );
}
