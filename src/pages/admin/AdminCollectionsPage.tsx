import { useState } from "react";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AdminCollectionModal from "../../components/admin/AdminCollectionModal";
import AdminCollectionsTable from "../../components/admin/AdminCollectionsTable";
import CollectionDeleteModal from "../../components/project-settings/CollectionDeleteModal";
import type { AdminCollectionRow, CollectionFormValues } from "../../types/admin";

type Dialog = { kind: "create" } | { kind: "edit"; collection: AdminCollectionRow } | { kind: "delete"; collection: AdminCollectionRow };

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminCollectionsPageProps {
  /** Every collection on the instance; the page sorts them. */
  collections: AdminCollectionRow[];
  /** Every project, as [name, id], for the form's picker. */
  projectOptions: [label: string, value: string][];
  /** Creates a collection. Resolves when the host has it (the host announces it); rejects with field errors. */
  onCreate: (values: CollectionFormValues) => Promise<void>;
  /** Renames or moves a collection. */
  onUpdate: (id: string, values: CollectionFormValues) => Promise<void>;
  /** Deletes a collection, after the page has asked the user to confirm. */
  onDelete: (id: string) => Promise<void>;
}

/**
 * Inventory view `admin-collections` (CollectionLive.Index): the
 * instance-wide collections table with its create, edit and delete dialogs,
 * which are the page's own state. Props only, so it can run unchanged in
 * Lightning; the replica's data and toasts live in
 * AdminCollectionsPage.replica.tsx.
 */
export default function AdminCollectionsPage({ collections, projectOptions, onCreate, onUpdate, onDelete }: AdminCollectionsPageProps) {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);

  return (
    <PageContent header={<Header title="Collections" />}>
      <Centered>
        <AdminCollectionsTable
          collections={collections}
          onCreate={() => setDialog({ kind: "create" })}
          onEdit={(collection) => setDialog({ kind: "edit", collection })}
          onDelete={(collection) => setDialog({ kind: "delete", collection })}
        />
        {dialog?.kind === "create" && (
          <AdminCollectionModal
            projectOptions={projectOptions}
            onCancel={close}
            onSave={async (values) => {
              await onCreate(values);
              close();
            }}
          />
        )}
        {dialog?.kind === "edit" && (
          <AdminCollectionModal
            key={dialog.collection.id}
            collection={dialog.collection}
            projectOptions={projectOptions}
            onCancel={close}
            onSave={async (values) => {
              await onUpdate(dialog.collection.id, values);
              close();
            }}
          />
        )}
        {dialog?.kind === "delete" && (
          <CollectionDeleteModal
            collection={dialog.collection}
            onCancel={close}
            onDelete={async () => {
              await onDelete(dialog.collection.id);
              close();
            }}
          />
        )}
      </Centered>
    </PageContent>
  );
}
