import type { AdminUserRow, UserFormValues } from "../../types/admin";
import type { UserRole } from "../../types/users";
import { userRoleOptions } from "../../constants";
import { errorMessage } from "../../utils/errors";
import { useForm } from "../../utils/useForm";
import { blank } from "../../utils/validate";
import Alert from "../Alert";
import Button from "../Button";
import { Checkbox, PasswordInput, Select, TextInput } from "../Inputs";
import Toggle from "../Toggle";

interface Props {
  /** The account being edited; omit for /settings/users/new. */
  user?: AdminUserRow | undefined;
  /** Saves the form. Rejects with field errors, which land on their fields, or a message, shown above the buttons. */
  onSave: (values: UserFormValues) => Promise<void>;
  /** Where Cancel goes. */
  cancelTo?: string;
}

/**
 * Lightning's admin user form (user_live/form_component.html.heex): name,
 * email, password, role, the Support User toggle (with its heads-up), and on
 * edit the scheduled deletion (for the `user` role only) and disabled
 * fields. Save is always enabled: pressing it shows what's missing on each
 * field, and the host checks everything again on save.
 */
export default function UserForm({ user, onSave, cancelTo = "/settings/users" }: Props) {
  const isEdit = !!user;
  const form = useForm<UserFormValues>({
    initial: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "user",
      supportUser: user?.supportUser ?? false,
      scheduledDeletion: user?.scheduledDeletion ?? "",
      disabled: user?.disabled ?? false,
    },
    validate: ({ firstName, lastName, email, password }) => ({
      firstName: blank(firstName),
      lastName: blank(lastName),
      email: blank(email),
      password: !isEdit && password.length < 12 ? ["Password minimum length is 12 characters."] : [],
    }),
  });
  const { values, set } = form;

  return (
    <div id={`user-${user?.id ?? "new"}`}>
      <form id="user-form" className="w-1/2 space-y-2" onSubmit={form.submit(onSave)} aria-busy={form.pending || undefined}>
        <TextInput id="user_first_name" name="first_name" label="First Name" {...form.fieldProps("firstName")} />
        <TextInput id="user_last_name" name="last_name" label="Last Name" {...form.fieldProps("lastName")} />
        <TextInput id="user_email" name="email" label="Email" {...form.fieldProps("email")} />
        <PasswordInput id="user_password" name="password" label="Password" autoComplete="new-password" {...form.fieldProps("password")} />
        <Select
          id="user_role"
          name="role"
          label="Role"
          options={userRoleOptions}
          value={values.role}
          errors={form.errors.role}
          onChange={(e) => set("role", e.target.value as UserRole)}
        />
        <Toggle id="user_support_user" name="support_user" checked={values.supportUser} onChange={(v) => set("supportUser", v)} label="Support User" />
        {values.supportUser && (
          <Alert id="heads-up-description" type="warning" header="Heads Up!">
            <p>This user will be able to access ALL projects that have support access enabled</p>
          </Alert>
        )}

        {isEdit && (
          <>
            {values.role === "user" && (
              <TextInput id="user_scheduled_deletion" name="scheduled_deletion" label="Scheduled Deletion" {...form.fieldProps("scheduledDeletion")} />
            )}
            <Checkbox
              id="user_disabled"
              name="disabled"
              label="A disabled user will not be allowed to login."
              checked={values.disabled}
              onChange={(e) => set("disabled", e.target.checked)}
            />
          </>
        )}

        {form.error && (
          <Alert type="danger" className="mt-4">
            {errorMessage(form.error)}
          </Alert>
        )}

        <div className="flex gap-1">
          <Button id="save-user" type="submit" pending={form.pending}>
            Save
          </Button>
          <Button theme="secondary" to={cancelTo}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
