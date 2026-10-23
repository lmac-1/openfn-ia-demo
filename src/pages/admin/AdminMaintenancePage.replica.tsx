import { useToast } from "../../components/Toast";
import { simulateRequest } from "../../mock-data/request";
import AdminMaintenancePage from "./AdminMaintenancePage";

/**
 * The replica's side of AdminMaintenancePage: each action waits a moment and
 * shows the toast Lightning flashes. Lightning replaces this file with a
 * LiveView wrapper.
 */
export default function AdminMaintenancePageReplica() {
  const toast = useToast();
  return (
    <AdminMaintenancePage
      onRefreshAdaptors={async () => {
        await simulateRequest();
        toast("Adaptor refresh queued.");
      }}
      onRefreshIcons={async () => {
        await simulateRequest();
        toast("Icon refresh started.");
      }}
    />
  );
}
