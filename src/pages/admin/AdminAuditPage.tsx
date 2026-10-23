import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AuditTable from "../../components/admin/AuditTable";
import type { AuditEvent } from "../../types/admin";
import type { PageInfo } from "../../types/lists";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminAuditPageProps {
  /** The audit events on the current page, newest first, as the server pages them. */
  events: AuditEvent[];
  /** The current page (`?page=`); the page links to the others. */
  page: PageInfo;
}

/**
 * Inventory view `admin-audit` (AuditLive.Index): /settings/audit. Props
 * only, so it can run unchanged in Lightning; the replica's data and URL
 * state live in AdminAuditPage.replica.tsx.
 */
export default function AdminAuditPage({ events, page }: AdminAuditPageProps) {
  return (
    <PageContent header={<Header title="Audit" />}>
      <Centered>
        <AuditTable events={events} page={page} />
      </Centered>
    </PageContent>
  );
}
