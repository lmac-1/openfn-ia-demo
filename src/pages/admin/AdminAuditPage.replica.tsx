import { auditEvents, auditPageSize } from "../../mock-data/admin";
import { useUrlParams } from "../../utils/useUrlParams";
import AdminAuditPage from "./AdminAuditPage";

/**
 * The replica's side of AdminAuditPage: reads the page from the URL and
 * slices the fixtures as the server would. Lightning will replace this file
 * with a LiveView wrapper; AdminAuditPage stays as it is.
 */
export default function AdminAuditPageReplica() {
  const { params } = useUrlParams<"page">();
  // As Scrivener does: a whole page number, and an overflow page moved back to the last.
  const lastPage = Math.max(1, Math.ceil(auditEvents.length / auditPageSize));
  const page = Math.min(lastPage, Math.max(1, Math.trunc(Number(params.page)) || 1));

  return (
    <AdminAuditPage
      events={auditEvents.slice((page - 1) * auditPageSize, page * auditPageSize)}
      page={{ number: page, size: auditPageSize, totalEntries: auditEvents.length }}
    />
  );
}
