import { useState } from "react";
import { useToast } from "../../components/Toast";
import { backupCodes, regenerateFakeBackupCodes } from "../../mock-data/tokens";
import { simulateRequest } from "../../mock-data/request";
import { useCurrentUser } from "../../session/session";
import BackupCodesPage from "./BackupCodesPage";

/**
 * The replica's side of BackupCodesPage: holds the fixtures in state as the
 * server would, reads MFA from the session, awaits simulateRequest and fires
 * the success toast. The demo has no printable copy, so Print prints the
 * page. Lightning replaces this file with a LiveView wrapper.
 */
export default function BackupCodesPageReplica() {
  const currentUser = useCurrentUser();
  const toast = useToast();
  const [codes, setCodes] = useState(backupCodes);

  return (
    <BackupCodesPage
      codes={codes}
      mfaEnabled={currentUser.mfaEnabled}
      onRegenerate={async () => {
        await simulateRequest();
        setCodes(regenerateFakeBackupCodes());
        toast("New Backup Codes Generated!");
      }}
      onPrint={() => window.print()}
    />
  );
}
