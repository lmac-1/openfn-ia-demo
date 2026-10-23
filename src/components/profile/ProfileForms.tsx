import type { FormEvent, ReactNode } from "react";
import Alert from "../Alert";
import Button from "../Button";
import Card from "../Card";
import InfoTooltip from "../InfoTooltip";
import { PasswordInput, Select, TextInput } from "../Inputs";
import type { User } from "../../types/users";
import { contactPreferenceOptions, contactPreferenceTooltip } from "../../constants";
import { errorMessage } from "../../utils/errors";
import { useForm } from "../../utils/useForm";
import { blank, isValidEmail } from "../../utils/validate";

/**
 * The three forms of ProfileLive.FormComponent (profile_live/form_component.html.heex),
 * each its own card. Each `on*` handler may be async; a failure shows in the card.
 */

function FormCard({
  id,
  title,
  onSubmit,
  error,
  children,
  button,
}: {
  id: string;
  title: string;
  onSubmit: (e: FormEvent) => void;
  error: Error | null;
  children: ReactNode;
  button: ReactNode;
}) {
  return (
    <form id={id} onSubmit={onSubmit} data-annotation="profile-account">
      <Card padding="lg" title={title} className="space-y-6">
        {children}
        {error && <Alert type="danger">{errorMessage(error)}</Alert>}
        {button}
      </Card>
    </form>
  );
}

type BasicInfo = Pick<User, "firstName" | "lastName" | "contactPreference">;

export function BasicInfoForm({ user, onSave }: { user: User; onSave?: (u: BasicInfo) => Promise<void> }) {
  const form = useForm<BasicInfo>({
    initial: { firstName: user.firstName, lastName: user.lastName, contactPreference: user.contactPreference },
    validate: ({ firstName, lastName }) => ({ firstName: blank(firstName), lastName: blank(lastName) }),
  });
  return (
    <FormCard
      id="basic-info-form"
      title="Change basic information"
      onSubmit={form.submit(async (values) => onSave?.(values))}
      error={form.error}
      button={
        <Button type="submit" disabled={!form.dirty} pending={form.pending}>
          Save
        </Button>
      }
    >
      <TextInput label="First name" required autoComplete="given-name" {...form.fieldProps("firstName")} />
      <TextInput label="Last name" required autoComplete="family-name" {...form.fieldProps("lastName")} />
      <Select
        label={
          <>
            Contact preference<span className="text-red-500"> *</span>
            <InfoTooltip title={contactPreferenceTooltip} />
          </>
        }
        options={contactPreferenceOptions}
        {...form.fieldProps("contactPreference")}
      />
    </FormCard>
  );
}

export function ChangeEmailForm({ onSubmit }: { onSubmit?: (email: string) => Promise<void> }) {
  const form = useForm({
    initial: { email: "", password: "" },
    validate: ({ email, password }) => ({
      email: email.trim() && !isValidEmail(email) ? ["must be a valid email address"] : blank(email),
      password: blank(password),
    }),
    clearOnSave: true,
  });
  return (
    <FormCard
      id="email-form"
      title="Change email"
      onSubmit={form.submit(async ({ email }) => onSubmit?.(email))}
      error={form.error}
      button={
        <Button type="submit" pending={form.pending}>
          Update email
        </Button>
      }
    >
      <TextInput label="New email address" required {...form.fieldProps("email")} />
      <PasswordInput label="Enter password to confirm" required autoComplete="current-password" {...form.fieldProps("password")} />
    </FormCard>
  );
}

export function ChangePasswordForm({ onSubmit }: { onSubmit?: () => Promise<void> }) {
  const form = useForm({
    initial: { password: "", confirmation: "", current: "" },
    validate: ({ password, confirmation, current }) => ({
      password: password.trim() && password.length < 12 ? ["should be at least 12 character(s)"] : blank(password),
      confirmation: confirmation !== password ? ["does not match password"] : [],
      current: blank(current),
    }),
    clearOnSave: true,
  });
  return (
    <FormCard
      id="password-form"
      title="Change password"
      onSubmit={form.submit(async () => onSubmit?.())}
      error={form.error}
      button={
        <Button type="submit" pending={form.pending}>
          Update password
        </Button>
      }
    >
      <PasswordInput label="New password" required autoComplete="new-password" {...form.fieldProps("password")} />
      <PasswordInput label="Confirm new password" required autoComplete="new-password" {...form.fieldProps("confirmation")} />
      <PasswordInput label="Current password" required autoComplete="current-password" {...form.fieldProps("current")} />
    </FormCard>
  );
}
