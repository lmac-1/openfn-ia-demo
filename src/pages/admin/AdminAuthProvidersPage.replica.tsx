import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { authProvider, emptyAuthProvider } from "../../mock-data/admin";
import { simulateRequest } from "../../mock-data/request";
import AdminAuthProvidersPage from "./AdminAuthProvidersPage";

/**
 * The replica's side of AdminAuthProvidersPage: /settings/authentication
 * edits the fixture provider (or redirects to /new when there is none),
 * /new is a blank form; a Test always passes; the toasts Lightning flashes.
 * Lightning replaces this file with a LiveView wrapper.
 */
export default function AdminAuthProvidersPageReplica() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = pathname.endsWith("/new");
  if (!isNew && !authProvider) return <Navigate to="/settings/authentication/new" replace />;
  const provider = isNew || !authProvider ? emptyAuthProvider : authProvider;

  return (
    <AdminAuthProvidersPage
      provider={provider}
      onSave={async () => {
        await simulateRequest();
        toast(provider.id ? "Authentication Provider updated." : "Authentication Provider created.");
        if (!provider.id) navigate("/settings/authentication");
      }}
      onTest={async () => {
        await simulateRequest();
      }}
      onRemove={async () => {
        await simulateRequest();
        toast("Authentication Provider removed");
        navigate("/settings/authentication/new");
      }}
    />
  );
}
