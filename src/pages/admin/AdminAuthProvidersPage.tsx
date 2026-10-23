import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AuthProviderForm from "../../components/admin/AuthProviderForm";
import type { AuthProvider, AuthProviderValues } from "../../types/admin";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface AdminAuthProvidersPageProps {
  /** The configured provider, or a blank one (id null) on /new. */
  provider: AuthProvider;
  /** Creates or updates the provider. Resolves when the host has it (it flashes, and after a create shows the edit route); rejects with field errors. */
  onSave: (values: AuthProviderValues) => Promise<void>;
  /** Fetches the discovery document with these values. Resolves on success; rejects with why not. */
  onTest: (values: AuthProviderValues) => Promise<void>;
  /** Removes the provider. Resolves when the host has (it then shows the blank form). */
  onRemove: () => Promise<void>;
}

/**
 * Inventory view `admin-auth-providers` (AuthProvidersLive.Index): the
 * OpenID Connect provider form, blank on /settings/authentication/new.
 * Props only, so it can run unchanged in Lightning; the replica's fixture,
 * redirect and toasts live in AdminAuthProvidersPage.replica.tsx.
 */
export default function AdminAuthProvidersPage({ provider, onSave, onTest, onRemove }: AdminAuthProvidersPageProps) {
  return (
    <PageContent header={<Header title="Authentication" />}>
      <Centered>
        <AuthProviderForm key={provider.id ?? "new"} provider={provider} onSave={onSave} onTest={onTest} onRemove={onRemove} />
      </Centered>
    </PageContent>
  );
}
