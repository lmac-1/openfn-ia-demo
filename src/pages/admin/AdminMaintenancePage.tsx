import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import MaintenanceCard from "../../components/admin/MaintenanceCard";
import { useToast } from "../../components/Toast";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminMaintenancePageProps {
  /** Queues a registry refresh. Resolves when the host has taken it; the host announces the result. */
  onRefreshAdaptors: () => Promise<void>;
  /** Starts the icon refresh, which the host reports when it finishes. */
  onRefreshIcons: () => Promise<void>;
}

/**
 * Inventory view `admin-maintenance` (MaintenanceLive.Index): two actions a
 * superuser can run. Props only, so it can run unchanged in Lightning; the
 * replica's toasts live in AdminMaintenancePage.replica.tsx. A refusal or a
 * lost connection is said here; success is the host's.
 */
export default function AdminMaintenancePage({ onRefreshAdaptors, onRefreshIcons }: AdminMaintenancePageProps) {
  const toast = useToast();
  const failed = (error: unknown) => toast(errorMessage(error), "error");
  const adaptors = useAction(onRefreshAdaptors, { onError: failed });
  const icons = useAction(onRefreshIcons, { onError: failed });
  return (
    <PageContent header={<Header title="Maintenance" />}>
      <Centered>
        <div className="flex flex-col gap-4">
          <MaintenanceCard
            id="refresh-adaptors-card"
            buttonId="refresh-adaptors-button"
            title="Refresh Adaptor Registry"
            description="Re-fetch the list of available adaptors and their versions."
            onRun={() => void adaptors.run()}
            running={adaptors.pending}
          />
          <MaintenanceCard
            id="refresh-icons-card"
            buttonId="refresh-icons-button"
            title="Refresh Adaptor Icons"
            description="Re-fetch icons for every adaptor and replace rows whose icon has changed. Does not touch adaptor metadata or version history."
            onRun={() => void icons.run()}
            running={icons.pending}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
