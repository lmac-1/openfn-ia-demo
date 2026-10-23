import { useState, type FormEvent } from "react";
import AuthPanelLayout, {
  AuthPanel,
  AuthPanelHint,
  AuthPanelTitle,
  HavingProblems,
} from "../../components/auth/AuthPanelLayout";
import Alert from "../../components/Alert";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import UserAvatar from "../../components/UserAvatar";
import { PasswordInput, TextInput } from "../../components/Inputs";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/** What the user confirms with: one or the other. */
export type ConfirmAccessValues = { password: string } | { code: string };

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AuthConfirmAccessPageProps {
  user: { firstName: string; lastName: string; mfaEnabled: boolean };
  /** Confirms. Resolves when the host accepts (it then sends the user on); rejects with the refusal to show. */
  onConfirm: (values: ConfirmAccessValues) => Promise<void>;
}

/**
 * Inventory view `auth-confirm-access` (re_authenticate_live/new.html.heex):
 * the sudo-mode re-authentication page. Password by default; the
 * authenticator option appears when the user has MFA on, and switching is
 * the page's own. Props only, so it can run unchanged in Lightning.
 */
export default function AuthConfirmAccessPage({ user, onConfirm }: AuthConfirmAccessPageProps) {
  const [option, setOption] = useState<"password" | "totp">("password");
  const [value, setValue] = useState("");
  const confirm = useAction(onConfirm);

  const switchTo = (next: "password" | "totp") => {
    setOption(next);
    setValue("");
    confirm.reset();
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void confirm.run(option === "password" ? { password: value } : { code: value });
  };

  return (
    <AuthPanelLayout title="Confirm access">
      <AuthPanel size="sm">
        <div className="flex flex-col items-center gap-2">
          <UserAvatar firstName={user.firstName} lastName={user.lastName} size="sm" />
          <p>
            Signed in as: <span className="font-bold">{`${user.firstName} ${user.lastName}`}</span>
          </p>
        </div>
      </AuthPanel>
      <AuthPanel>
        <AuthPanelTitle>{option === "password" ? "Password" : "Authentication Code"}</AuthPanelTitle>
        {confirm.error && <Alert type="danger">{errorMessage(confirm.error)}</Alert>}
        <form id="reauthentication-form" onSubmit={onSubmit} className="space-y-4" aria-busy={confirm.pending || undefined}>
          {option === "password" ? (
            <PasswordInput
              id="user_password"
              name="password"
              aria-label="Password"
              required
              autoComplete="current-password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <TextInput
              id="user_code"
              name="code"
              aria-label="Authentication code"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="XXXXXX"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <Button type="submit" className="w-full" pending={confirm.pending}>
            {option === "password" ? "Confirm" : "Verify"}
          </Button>
          <AuthPanelHint>
            {option === "totp"
              ? "Open your two-factor authenticator (TOTP) app or browser extension to view your authentication code."
              : "Enter your password to confirm access"}
          </AuthPanelHint>
        </form>
      </AuthPanel>
      <HavingProblems>
        {option === "password" && user.mfaEnabled && (
          <li>
            <TextLink id="use-totp" onClick={() => switchTo("totp")}>
              Use your authenticator app instead
            </TextLink>
          </li>
        )}
        {option === "totp" && (
          <li>
            <TextLink id="use-password" onClick={() => switchTo("password")}>
              Use your password instead
            </TextLink>
          </li>
        )}
      </HavingProblems>
    </AuthPanelLayout>
  );
}
