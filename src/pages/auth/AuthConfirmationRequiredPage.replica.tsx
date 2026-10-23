import { unconfirmedUser } from "../../mock-data/auth";
import { simulateRequest } from "../../mock-data/request";
import AuthConfirmationRequiredPage from "./AuthConfirmationRequiredPage";

/**
 * The replica's side of AuthConfirmationRequiredPage: the fixture's address,
 * a resend that always says "sent" and a change that is always accepted.
 * The throttled and failed answers are in the page's test and stories.
 * Lightning replaces this file with a LiveView wrapper.
 */
export default function AuthConfirmationRequiredPageReplica() {
  return (
    <AuthConfirmationRequiredPage
      email={unconfirmedUser.email}
      onResend={async () => {
        await simulateRequest();
        return { status: "sent" };
      }}
      onChangeEmail={async ({ email }) => {
        await simulateRequest();
        return { status: "requested", email };
      }}
      logoutTo="/users/log_in"
    />
  );
}
