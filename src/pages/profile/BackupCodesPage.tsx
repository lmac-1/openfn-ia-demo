import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import BackupCodesCard from "../../components/profile/BackupCodesCard";
import MfaDisabledNotice from "../../components/profile/MfaDisabledNotice";
import { useToast } from "../../components/Toast";
import type { BackupCode } from "../../types/tokens";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface BackupCodesPageProps {
  /** The signed-in user's recovery codes, used ones included, as the server lists them. */
  codes: BackupCode[];
  /** Whether the user has MFA on; without it the page shows the "MFA Disabled" notice above the codes. */
  mfaEnabled: boolean;
  /** Replaces every code. Rejects on failure, which the page toasts; the host says when it worked. */
  onRegenerate: () => Promise<void>;
  /** Opens the printable copy. */
  onPrint: () => void;
}

/**
 * Inventory view `profile-backup-codes` (backup_codes_live/index.html.heex).
 * Lightning puts this behind sudo mode (re-enter password); the host handles
 * that. Props only, so it can run unchanged in Lightning; the replica's data
 * and toasts live in BackupCodesPage.replica.tsx.
 */
export default function BackupCodesPage({ codes, mfaEnabled, onRegenerate, onPrint }: BackupCodesPageProps) {
  const toast = useToast();
  const regenerate = useAction(onRegenerate, { onError: (e) => toast(errorMessage(e), "error") });
  return (
    <PageContent header={<Header title="Two-factor backup codes" />}>
      <Centered>
        <div className="space-y-4 md:w-2/3">
          <p>
            Recovery codes can be used to access your account in the event you lose access to your device and cannot
            receive two-factor authentication codes.
          </p>
          {!mfaEnabled && <MfaDisabledNotice />}
          <BackupCodesCard
            codes={codes}
            onRegenerate={() => regenerate.run()}
            regenerating={regenerate.pending}
            onPrint={onPrint}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
