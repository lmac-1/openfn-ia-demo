// The package's public surface: anything a consumer needs goes through here.

export { default as AdminAuditPage } from "./pages/admin/AdminAuditPage";
export { default as AdminAuthProvidersPage } from "./pages/admin/AdminAuthProvidersPage";
export { default as AdminCollectionsPage } from "./pages/admin/AdminCollectionsPage";
export { default as AdminMaintenancePage } from "./pages/admin/AdminMaintenancePage";
export { default as AdminProjectsPage } from "./pages/admin/AdminProjectsPage";
export { default as AdminUserEditPage } from "./pages/admin/AdminUserEditPage";
export { default as AdminUsersPage } from "./pages/admin/AdminUsersPage";
export { default as AuthConfirmAccessPage } from "./pages/auth/AuthConfirmAccessPage";
export { default as AuthConfirmationRequiredPage } from "./pages/auth/AuthConfirmationRequiredPage";
export { default as FirstSetupPage } from "./pages/auth/FirstSetupPage";
export { default as ChannelRequestShowPage } from "./pages/history/ChannelRequestShowPage";
export { default as DataclipShowPage } from "./pages/history/DataclipShowPage";
export { default as HistoryChannelLogsPage } from "./pages/history/HistoryChannelLogsPage";
export { default as RunShowPage } from "./pages/history/RunShowPage";
export { default as BackupCodesPage } from "./pages/profile/BackupCodesPage";
export { default as TokensPage } from "./pages/profile/TokensPage";
export { default as ChannelsIndexPage } from "./pages/projects/ChannelsIndexPage";
export { default as MfaRequiredPage } from "./pages/projects/MfaRequiredPage";
export { default as ProjectsDashboardPage } from "./pages/projects/ProjectsDashboardPage";
export { default as WorkflowHealthPage } from "./pages/projects/WorkflowHealthPage";
export { default as WorkflowsIndexPage } from "./pages/projects/WorkflowsIndexPage";

export type { AdminAuditPageProps } from "./pages/admin/AdminAuditPage";
export type { AdminAuthProvidersPageProps } from "./pages/admin/AdminAuthProvidersPage";
export type { AdminCollectionsPageProps } from "./pages/admin/AdminCollectionsPage";
export type { AdminMaintenancePageProps } from "./pages/admin/AdminMaintenancePage";
export type { AdminProjectsPageProps } from "./pages/admin/AdminProjectsPage";
export type { AdminUserEditPageProps } from "./pages/admin/AdminUserEditPage";
export type { AdminUsersPageProps } from "./pages/admin/AdminUsersPage";
export type { AuthConfirmAccessPageProps } from "./pages/auth/AuthConfirmAccessPage";
export type { AuthConfirmationRequiredPageProps } from "./pages/auth/AuthConfirmationRequiredPage";
export type { FirstSetupPageProps } from "./pages/auth/FirstSetupPage";
export type { ChannelRequestShowPageProps } from "./pages/history/ChannelRequestShowPage";
export type { DataclipShowPageProps } from "./pages/history/DataclipShowPage";
export type { HistoryChannelLogsPageProps } from "./pages/history/HistoryChannelLogsPage";
export type { RunShowPageProps } from "./pages/history/RunShowPage";
export type { BackupCodesPageProps } from "./pages/profile/BackupCodesPage";
export type { TokensPageProps } from "./pages/profile/TokensPage";
export type { ChannelsIndexPageProps } from "./pages/projects/ChannelsIndexPage";
export type { ProjectsDashboardPageProps } from "./pages/projects/ProjectsDashboardPage";
export type { WorkflowHealthPageProps } from "./pages/projects/WorkflowHealthPage";
export type { WorkflowsIndexPageProps } from "./pages/projects/WorkflowsIndexPage";

export type { ChangeEmailResult, ChangeEmailValues, ResendResult } from "./pages/auth/AuthConfirmationRequiredPage";
export type { ConfirmAccessValues } from "./pages/auth/AuthConfirmAccessPage";
export type { FirstSetupValues } from "./pages/auth/FirstSetupPage";
export type { ErrorSignatures, Outcomes, RunVolume } from "./types/workflow-health";

export type {
  AdminCollectionRow,
  AdminDeleteProject,
  AdminDeleteUser,
  AdminProjectForm,
  AdminProjectFormValues,
  AdminProjectRow,
  AdminUserRow,
  AuditEvent,
  AuthProvider,
  AuthProviderValues,
  CollectionFormValues,
  UserFormValues,
} from "./types/admin";
export type { ChannelForm, ChannelFormValues, ChannelRow } from "./types/channels";
export type { LogLine, StepDataclip } from "./types/history";
export type { PageInfo, SortState } from "./types/lists";
export type { CurrentProject } from "./types/projects";
export type { ApiToken, BackupCode } from "./types/tokens";
export type { ProjectMetrics, ProjectOverview, WorkflowRow } from "./types/workflows";

export { RouterProvider } from "./routing/router";
export type { NavigateOptions, Router } from "./routing/router";
export { ToastProvider, useToast } from "./components/Toast";
export { RequestError } from "./utils/errors";
export { setUpMonaco } from "./components/monacoTheme";
export { default as Sidebar } from "./components/shell/Sidebar";
export type { SidebarProps } from "./components/shell/Sidebar";
