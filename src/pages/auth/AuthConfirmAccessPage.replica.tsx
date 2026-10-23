import { useNavigate } from "react-router-dom";
import { simulateRequest } from "../../mock-data/request";
import { useCurrentUser } from "../../session/session";
import AuthConfirmAccessPage from "./AuthConfirmAccessPage";

/**
 * The replica's side of AuthConfirmAccessPage: the signed-in user from the
 * session; any input is accepted and returns to the profile page. Lightning
 * replaces this file with a LiveView wrapper.
 */
export default function AuthConfirmAccessPageReplica() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  return (
    <AuthConfirmAccessPage
      user={{ firstName: user.firstName, lastName: user.lastName, mfaEnabled: user.mfaEnabled }}
      onConfirm={async () => {
        await simulateRequest();
        navigate("/profile");
      }}
    />
  );
}
