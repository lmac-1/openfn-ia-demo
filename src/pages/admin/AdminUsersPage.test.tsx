import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import { ToastProvider } from "../../components/Toast";
import type { AdminDeleteUser, AdminUserRow } from "../../types/admin";
import { RequestError } from "../../utils/errors";
import AdminUsersPage from "./AdminUsersPage";

const rows: AdminUserRow[] = [
  { id: "u1", firstName: "Alice", lastName: "Smith", email: "alice@example.org", role: "user", supportUser: false, disabled: false, scheduledDeletion: null },
  { id: "u2", firstName: "Bob", lastName: "Johnson", email: "bob@example.org", role: "superuser", supportUser: false, disabled: false, scheduledDeletion: "2026-10-21T09:30:00Z" },
  { id: "u3", firstName: "Charlie", lastName: "Brown", email: "charlie@example.org", role: "user", supportUser: true, disabled: true, scheduledDeletion: null },
];

const alice: AdminDeleteUser = { id: "u1", email: "alice@example.org", scheduledDeletion: null, hasActivityInProjects: false };

const emails = () => Array.from(document.querySelectorAll("tbody tr td:nth-child(3)")).map((td) => td.textContent?.trim());
const rowOf = (email: string) => screen.getByText(email).closest("tr")!;
const openActions = async (email: string) => {
  await userEvent.click(within(rowOf(email)).getByRole("button", { name: /Actions/ }));
  return screen.getByRole("menu");
};

function renderPage(props: Partial<React.ComponentProps<typeof AdminUsersPage>> = {}) {
  const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/settings/users", search: "", hash: "" }) };
  const handlers = {
    onCancelDeletion: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
  render(
    <RouterProvider value={router}>
      <ToastProvider>
        <AdminUsersPage users={rows} deleteUser={null} {...handlers} {...props} />
      </ToastProvider>
    </RouterProvider>
  );
  return { ...handlers, router };
}

describe("AdminUsersPage", () => {
  it("lists every account by email with its role, enabled and support ticks, and the superuser note", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Users" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /New User/ }).getAttribute("href")).toBe("/settings/users/new");
    expect(emails()).toEqual(["alice@example.org", "bob@example.org", "charlie@example.org"]);
    const charlie = rowOf("charlie@example.org");
    expect(charlie.textContent).toContain("user");
    // Enabled? is blank, Support? ticked.
    expect(charlie.querySelectorAll(".hero-check-circle-solid")).toHaveLength(1);
    expect(rowOf("alice@example.org").querySelectorAll(".hero-check-circle-solid")).toHaveLength(1);
    expect(rowOf("bob@example.org").textContent).toContain("21 Oct  09:30");
    expect(screen.getByText(/can access/).textContent).toContain("everything");
  });

  it("sorts by any column in either direction, disabled and superusers first", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Email/ }));
    expect(emails()).toEqual(["charlie@example.org", "bob@example.org", "alice@example.org"]);
    fireEvent.click(screen.getByRole("button", { name: /First name/ }));
    expect(emails()).toEqual(["alice@example.org", "bob@example.org", "charlie@example.org"]);
    fireEvent.click(screen.getByRole("button", { name: /Enabled\?/ }));
    expect(emails()[0]).toBe("charlie@example.org");
    fireEvent.click(screen.getByRole("button", { name: /Role/ }));
    expect(emails()[0]).toBe("bob@example.org");
  });

  it("filters by name, email or role, and the clear button appears only with text", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    const filter = screen.getByPlaceholderText("Filter users...");
    fireEvent.change(filter, { target: { value: "alice" } });
    expect(emails()).toEqual(["alice@example.org"]);
    fireEvent.change(filter, { target: { value: "superuser" } });
    expect(emails()).toEqual(["bob@example.org"]);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(emails()).toHaveLength(3);
  });

  it("never offers an active delete for a superuser, but keeps Cancel deletion", async () => {
    renderPage();
    const menu = await openActions("bob@example.org");
    expect(within(menu).getByRole("menuitem", { name: "Delete now" }).getAttribute("aria-disabled")).toBe("true");
    expect(within(menu).getByRole("menuitem", { name: "Cancel deletion" })).toBeTruthy();
  });

  it("offers a superuser not scheduled for deletion an inert Delete and no Cancel deletion", async () => {
    renderPage({ users: [{ ...rows[1]!, scheduledDeletion: null }] });
    const menu = await openActions("bob@example.org");
    expect(within(menu).getByRole("menuitem", { name: "Delete" }).getAttribute("aria-disabled")).toBe("true");
    expect(within(menu).queryByRole("menuitem", { name: "Cancel deletion" })).toBeNull();
  });

  it("links a user's Edit and Delete to their routes", async () => {
    renderPage();
    const menu = await openActions("alice@example.org");
    expect(within(menu).getByRole("menuitem", { name: "Edit" }).getAttribute("href")).toBe("/settings/users/u1");
    expect(within(menu).getByRole("menuitem", { name: "Delete" }).getAttribute("href")).toBe("/settings/users/u1/delete");
  });

  it("offers Delete now and Cancel deletion for a scheduled user", async () => {
    renderPage({ users: [{ ...rows[0]!, scheduledDeletion: "2026-10-21T09:30:00Z" }] });
    const menu = await openActions("alice@example.org");
    expect(within(menu).getByRole("menuitem", { name: "Delete now" }).getAttribute("href")).toBe("/settings/users/u1/delete");
    expect(within(menu).getByRole("menuitem", { name: "Cancel deletion" })).toBeTruthy();
  });

  it("cancels a scheduled deletion, and toasts when the host refuses", async () => {
    const onCancelDeletion = vi.fn().mockRejectedValue(new RequestError("Cancel user deletion failed"));
    renderPage({ onCancelDeletion });
    const menu = await openActions("bob@example.org");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Cancel deletion" }));
    await waitFor(() => expect(onCancelDeletion).toHaveBeenCalledWith("u2"));
    expect(await screen.findByText("Cancel user deletion failed")).toBeTruthy();
  });

  it("schedules the open dialog's account once its email is typed back", async () => {
    const { onDelete } = renderPage({ deleteUser: alice });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("This user's account and credential data will be deleted");
    expect(dialog.textContent).toContain("To confirm, type alice@example.org below.");
    const confirm = () => within(dialog).getByRole("button", { name: "Delete account" });
    expect(confirm().hasAttribute("disabled")).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("User email"), { target: { value: "alice@example" } });
    fireEvent.blur(within(dialog).getByLabelText("User email"));
    expect(within(dialog).getByText("This email doesn't match the user's email")).toBeTruthy();
    fireEvent.change(within(dialog).getByLabelText("User email"), { target: { value: "alice@example.org" } });
    // Enabled, the button is a new element: the disabled one sat inside its tooltip.
    fireEvent.click(confirm());
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("alice@example.org"));
  });

  it("keeps the dialog open with the host's reason", async () => {
    const onDelete = vi.fn().mockRejectedValue(new RequestError("You can't delete a superuser account."));
    renderPage({ deleteUser: alice, onDelete });
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("User email"), { target: { value: "alice@example.org" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete account" }));
    expect(await screen.findByText("You can't delete a superuser account.")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("only explains when a scheduled account with activity cannot be deleted yet", () => {
    const { onClose } = renderPage({ deleteUser: { ...alice, scheduledDeletion: "2026-10-21T09:30:00Z", hasActivityInProjects: true } });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("This user cannot be deleted until their auditable activities have also been purged.");
    expect(within(dialog).queryByRole("button", { name: "Delete account" })).toBeNull();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});
