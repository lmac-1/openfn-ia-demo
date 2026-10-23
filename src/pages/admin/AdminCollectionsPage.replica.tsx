import { useState } from "react";
import { useToast } from "../../components/Toast";
import { adminCollectionRows, collectionProjectOptions } from "../../mock-data/admin";
import { simulateRequest } from "../../mock-data/request";
import type { AdminCollectionRow } from "../../types/admin";
import { urlSafeName } from "../../utils/format";
import AdminCollectionsPage from "./AdminCollectionsPage";

/**
 * The replica's side of AdminCollectionsPage: the fixtures as rows, kept in
 * local state so creates, renames and deletes show, and the toasts Lightning
 * flashes. Lightning replaces this file with a LiveView wrapper.
 */
export default function AdminCollectionsPageReplica() {
  const [rows, setRows] = useState<AdminCollectionRow[]>(adminCollectionRows);
  const toast = useToast();
  const projectName = (id: string) => collectionProjectOptions.find(([, value]) => value === id)?.[0] ?? "";

  return (
    <AdminCollectionsPage
      collections={rows}
      projectOptions={collectionProjectOptions}
      onCreate={async ({ rawName, projectId }) => {
        await simulateRequest();
        setRows((r) => [
          ...r,
          { id: `col-${Date.now()}`, name: urlSafeName(rawName), projectId, projectName: projectName(projectId), byteSizeSum: 0 },
        ]);
        toast("Collection created successfully");
      }}
      onUpdate={async (id, { rawName, projectId }) => {
        await simulateRequest();
        setRows((r) => r.map((c) => (c.id === id ? { ...c, name: urlSafeName(rawName), projectId, projectName: projectName(projectId) } : c)));
        toast("Collection updated successfully");
      }}
      onDelete={async (id) => {
        await simulateRequest();
        setRows((r) => r.filter((c) => c.id !== id));
        toast("Collection deleted");
      }}
    />
  );
}
