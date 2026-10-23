import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserForm from "../../components/admin/UserForm";
import type { AdminUserRow, UserFormValues } from "../../types/admin";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminUserEditPageProps {
  /** The account being edited; null on /settings/users/new. */
  user: AdminUserRow | null;
  /** Saves the form. Resolves when the host has it (it then returns to the list); rejects with field errors or a message. */
  onSave: (values: UserFormValues) => Promise<void>;
}

/**
 * Inventory view `admin-user-edit` (UserLive.Edit): the form that creates an
 * account or changes any account's details, role and access. Props only, so
 * it can run unchanged in Lightning; the replica's data and routing live in
 * AdminUserEditPage.replica.tsx.
 */
export default function AdminUserEditPage({ user, onSave }: AdminUserEditPageProps) {
  return (
    <PageContent header={<Header title={user ? "Edit User" : "New User"} />}>
      <Centered>
        <UserForm key={user?.id ?? "new"} user={user ?? undefined} onSave={onSave} />
      </Centered>
    </PageContent>
  );
}
