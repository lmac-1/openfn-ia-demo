import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { simulateRequest } from "../../mock-data/request";
import { findUser } from "../../mock-data/users";
import AdminUserEditPage from "./AdminUserEditPage";

/**
 * The replica's side of AdminUserEditPage: the account from the fixtures (or
 * none on /new), the toast Lightning flashes, and the return to the list.
 * Lightning replaces this file with a LiveView wrapper.
 */
export default function AdminUserEditPageReplica() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = userId ? findUser(userId) : undefined;

  return (
    <AdminUserEditPage
      user={user ?? null}
      onSave={async () => {
        await simulateRequest();
        toast(user ? "User updated successfully" : "User created successfully");
        navigate("/settings/users");
      }}
    />
  );
}
