import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserDeletionModal from "../../components/admin/UserDeletionModal";
import UsersTable from "../../components/admin/UsersTable";
import { useToast } from "../../components/Toast";
import type { AdminDeleteUser, AdminUserRow } from "../../types/admin";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminUsersPageProps {
  /** Every account on the instance; the page sorts and filters them. */
  users: AdminUserRow[];
  /** The account whose deletion dialog is open (/settings/users/:id/delete); otherwise null. */
  deleteUser: AdminDeleteUser | null;
  /** Cancels a scheduled deletion, which re-enables the account. Rejects on failure, which the page toasts. */
  onCancelDeletion: (id: string) => Promise<void>;
  /** Schedules the open dialog's account for deletion, or deletes it now if already scheduled. Rejects with the reason, shown in the dialog. */
  onDelete: (email: string) => Promise<void>;
  /** Closes the deletion dialog. */
  onClose: () => void;
}

/**
 * Inventory view `admin-users` (UserLive.Index): every account with its
 * role, state and actions, and the deletion dialog the host opens by route.
 * Props only, so it can run unchanged in Lightning; the replica's data and
 * routing live in AdminUsersPage.replica.tsx.
 */
export default function AdminUsersPage({ users, deleteUser, onCancelDeletion, onDelete, onClose }: AdminUsersPageProps) {
  const toast = useToast();
  const cancel = useAction(onCancelDeletion, { onError: (e) => toast(errorMessage(e), "error") });

  return (
    <PageContent
      header={
        <Header title="Users">
          <Button to="/settings/users/new">
            <span className="hero-plus-solid h-4 w-4" />
            New User
          </Button>
        </Header>
      }
    >
      <Centered>
        {deleteUser && (
          <UserDeletionModal
            key={deleteUser.id}
            email={deleteUser.email}
            hasActivityInProjects={deleteUser.hasActivityInProjects}
            // user_deletion_modal.ex: deleting a scheduled account that still has activity is refused.
            blocked={!!deleteUser.scheduledDeletion && deleteUser.hasActivityInProjects}
            onClose={onClose}
            onDelete={onDelete}
          />
        )}
        <UsersTable users={users} onCancelDeletion={(user) => void cancel.run(user.id)} />
      </Centered>
    </PageContent>
  );
}
