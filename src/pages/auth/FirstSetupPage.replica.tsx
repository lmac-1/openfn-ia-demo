import { useNavigate } from "react-router-dom";
import FirstSetupShell from "../../components/auth/FirstSetupShell";
import { simulateRequest } from "../../mock-data/request";
import FirstSetupPage from "./FirstSetupPage";

/**
 * The replica's side of FirstSetupPage: the empty first-setup shell around
 * it, and a save that goes to /projects. Lightning's live layout draws the
 * shell and replaces this file with a LiveView wrapper.
 */
export default function FirstSetupPageReplica() {
  const navigate = useNavigate();
  return (
    <FirstSetupShell>
      <FirstSetupPage
        onSave={async () => {
          await simulateRequest();
          navigate("/projects");
        }}
      />
    </FirstSetupShell>
  );
}
