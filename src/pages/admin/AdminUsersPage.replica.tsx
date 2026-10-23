import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { hasActivityInProjects } from "../../mock-data/profile";
import { simulateRequest } from "../../mock-data/request";
import { users } from "../../mock-data/users";
import type { AdminUserRow } from "../../types/admin";
import AdminUsersPage from "./AdminUsersPage";

/** Lightning schedules the purge seven days out (Lightning.Config.purge_deleted_after_days). */
const inSevenDays = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

/**
 * The replica's side of AdminUsersPage: the fixtures as rows, kept in local
 * state so scheduling, cancelling and deleting show, the dialog chosen by
 * the route, and the toasts Lightning flashes. Lightning replaces this file
 * with a LiveView wrapper.
 */
export default function AdminUsersPageReplica() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState<AdminUserRow[]>(users);
  const target = userId ? rows.find((u) => u.id === userId) : undefined;
  const close = () => navigate("/settings/users");

  return (
    <AdminUsersPage
      users={rows}
      deleteUser={
        target ? { id: target.id, email: target.email, scheduledDeletion: target.scheduledDeletion, hasActivityInProjects } : null
      }
      onCancelDeletion={async (id) => {
        await simulateRequest();
        setRows((r) => r.map((u) => (u.id === id ? { ...u, scheduledDeletion: null, disabled: false } : u)));
        toast("User deletion canceled");
      }}
      onDelete={async () => {
        if (!target) return;
        await simulateRequest();
        if (target.scheduledDeletion) {
          setRows((r) => r.filter((u) => u.id !== target.id));
          toast("User deleted");
        } else {
          setRows((r) => r.map((u) => (u.id === target.id ? { ...u, scheduledDeletion: inSevenDays(), disabled: true } : u)));
          toast("User scheduled for deletion");
        }
        close();
      }}
      onClose={close}
    />
  );
}
