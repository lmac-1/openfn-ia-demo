import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { adminProjectRows } from "../../mock-data/admin";
import { purgeDeletedAfterDays } from "../../mock-data/project-settings";
import { findProject } from "../../mock-data/projects";
import { simulateRequest } from "../../mock-data/request";
import { users } from "../../mock-data/users";
import type { AdminProjectRow } from "../../types/admin";
import { urlSafeName } from "../../utils/format";
import AdminProjectsPage from "./AdminProjectsPage";

const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

/**
 * The replica's side of AdminProjectsPage: the fixtures as rows, kept in
 * local state so saves, scheduling and cancelling show, the form or the
 * dialog chosen by the route, and the toasts Lightning flashes. Lightning
 * replaces this file with a LiveView wrapper.
 */
export default function AdminProjectsPageReplica() {
  const { projectId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState<AdminProjectRow[]>(adminProjectRows);
  const back = () => navigate("/settings/projects");

  const isNew = pathname.endsWith("/settings/projects/new");
  const isDelete = pathname.endsWith("/delete");
  const project = projectId ? findProject(projectId) : undefined;
  const row = projectId ? rows.find((p) => p.id === projectId) : undefined;
  const formUsers = users.map(({ id, firstName, lastName, email }) => ({ id, firstName, lastName, email }));

  return (
    <AdminProjectsPage
      projects={rows}
      form={
        isNew
          ? { project: null, users: formUsers }
          : project && !isDelete
            ? { project: { id: project.id, name: project.name, members: project.members.map(({ userId, role }) => ({ userId, role })) }, users: formUsers }
            : null
      }
      deleteProject={isDelete && row ? { id: row.id, name: row.name } : null}
      gracePeriodDays={purgeDeletedAfterDays}
      onSave={async ({ rawName }) => {
        await simulateRequest();
        if (project && !isNew) setRows((r) => r.map((p) => (p.id === project.id ? { ...p, name: urlSafeName(rawName) } : p)));
        toast(isNew ? "Project created successfully" : "Project updated successfully");
        back();
      }}
      onDelete={async () => {
        if (!row) return;
        await simulateRequest();
        if (row.scheduledDeletion) {
          setRows((r) => r.filter((p) => p.id !== row.id));
          toast("Project deletion started. This may take a while to complete.");
        } else {
          setRows((r) => r.map((p) => (p.id === row.id ? { ...p, scheduledDeletion: inDays(purgeDeletedAfterDays) } : p)));
          toast("Project scheduled for deletion");
        }
        back();
      }}
      onCancelDeletion={async (id) => {
        await simulateRequest();
        setRows((r) => r.map((p) => (p.id === id ? { ...p, scheduledDeletion: null } : p)));
        toast("Project deletion canceled");
      }}
      onClose={back}
    />
  );
}
