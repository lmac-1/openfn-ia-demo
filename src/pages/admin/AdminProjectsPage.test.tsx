import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import { ToastProvider } from "../../components/Toast";
import type { AdminProjectRow, AdminProjectUser } from "../../types/admin";
import { RequestError } from "../../utils/errors";
import AdminProjectsPage from "./AdminProjectsPage";

const rows: AdminProjectRow[] = [
  { id: "p1", name: "alpha-project", description: "First project", insertedAt: "2023-12-01T00:00:00Z", ownerName: "John Owner", scheduledDeletion: null },
  { id: "p2", name: "beta-project", description: "Second project", insertedAt: "2023-01-01T00:00:00Z", ownerName: "", scheduledDeletion: "2026-10-21T09:30:00Z" },
  { id: "p3", name: "charlie-project", description: "", insertedAt: "2023-06-01T00:00:00Z", ownerName: "Zed Last", scheduledDeletion: null },
];

const users: AdminProjectUser[] = [
  { id: "u1", firstName: "Alice", lastName: "Alpha", email: "alice@example.com" },
  { id: "u2", firstName: "Bob", lastName: "Beta", email: "bob@example.com" },
  { id: "u3", firstName: "Charlie", lastName: "Gamma", email: "charlie@example.com" },
];

const names = () => Array.from(document.querySelectorAll("#projects tbody tr td:first-child")).map((td) => td.textContent?.trim());
const memberNames = () => Array.from(document.querySelectorAll("#project_users_table tbody tr td:first-child")).map((td) => td.textContent?.trim());
const rowOf = (text: string) => screen.getByText(text).closest("tr")!;
const openActions = async (text: string) => {
  await userEvent.click(within(rowOf(text)).getByRole("button", { name: /Actions/ }));
  return screen.getByRole("menu");
};
const radio = (userId: string, role: string) => document.getElementById(`project_users_${userId}_role_${role}`)!;
const save = () => screen.getByRole("button", { name: "Save" });

function renderPage(props: Partial<React.ComponentProps<typeof AdminProjectsPage>> = {}) {
  const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/settings/projects", search: "", hash: "" }) };
  const handlers = {
    onSave: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onCancelDeletion: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
  render(
    <RouterProvider value={router}>
      <ToastProvider>
        <AdminProjectsPage projects={rows} form={null} deleteProject={null} gracePeriodDays={7} {...handlers} {...props} />
      </ToastProvider>
    </RouterProvider>
  );
  return handlers;
}

describe("AdminProjectsPage list", () => {
  it("lists every project by name with its owner, or 'No owner', and sorts by name and creation date", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /New Project/ }).getAttribute("href")).toBe("/settings/projects/new");
    expect(names()).toEqual(["alpha-project", "beta-project", "charlie-project"]);
    expect(rowOf("beta-project").textContent).toContain("No owner");
    expect(rowOf("beta-project").textContent).toContain("21 Oct  09:30");
    expect(rowOf("alpha-project").textContent).toContain("John Owner");

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(names()).toEqual(["charlie-project", "beta-project", "alpha-project"]);
    fireEvent.click(screen.getByRole("button", { name: /Created At/ }));
    expect(names()).toEqual(["beta-project", "charlie-project", "alpha-project"]);
  });

  it("filters by name, description or owner, and the clear button appears only with text", () => {
    renderPage();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    const filter = screen.getByPlaceholderText("Filter projects...");
    fireEvent.change(filter, { target: { value: "alpha" } });
    expect(names()).toEqual(["alpha-project"]);
    fireEvent.change(filter, { target: { value: "First" } });
    expect(names()).toEqual(["alpha-project"]);
    fireEvent.change(filter, { target: { value: "John" } });
    expect(names()).toEqual(["alpha-project"]);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(names()).toHaveLength(3);
  });

  it("offers Edit and Delete, or Cancel deletion and Delete now once scheduled", async () => {
    const { onCancelDeletion } = renderPage();
    let menu = await openActions("alpha-project");
    expect(within(menu).getByRole("menuitem", { name: "Edit" }).getAttribute("href")).toBe("/settings/projects/p1");
    expect(within(menu).getByRole("menuitem", { name: "Delete" }).getAttribute("href")).toBe("/settings/projects/p1/delete");
    expect(within(menu).queryByRole("menuitem", { name: "Cancel deletion" })).toBeNull();
    expect(within(menu).queryByRole("menuitem", { name: "Delete now" })).toBeNull();
    await userEvent.keyboard("{Escape}");

    menu = await openActions("beta-project");
    expect(within(menu).getByRole("menuitem", { name: "Delete now" }).getAttribute("href")).toBe("/settings/projects/p2/delete");
    expect(within(menu).queryByRole("menuitem", { name: "Delete" })).toBeNull();
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Cancel deletion" }));
    await waitFor(() => expect(onCancelDeletion).toHaveBeenCalledWith("p2"));
  });

  it("toasts when the host refuses to cancel a deletion", async () => {
    renderPage({ onCancelDeletion: vi.fn().mockRejectedValue(new RequestError("Cancel project deletion failed")) });
    const menu = await openActions("beta-project");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Cancel deletion" }));
    expect(await screen.findByText("Cancel project deletion failed")).toBeTruthy();
  });
});

describe("AdminProjectsPage form", () => {
  it("creates a project once it has a name and exactly one owner, sending a role per user", async () => {
    const { onSave } = renderPage({ form: { project: null, users } });
    expect(screen.getByRole("heading", { name: "New Project" })).toBeTruthy();
    expect(screen.queryByText(/exactly one owner/)).toBeNull();
    expect(save().hasAttribute("disabled")).toBe(false);
    fireEvent.click(save());
    expect(screen.getByText("can't be blank")).toBeTruthy();
    expect(screen.getByText("Every project must have exactly one owner. Please specify one below.")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "some name" } });
    expect(screen.getByText("some-name")).toBeTruthy();
    expect(screen.getByText("Every project must have exactly one owner. Please specify one below.")).toBeTruthy();

    fireEvent.click(radio("u1", "owner"));
    fireEvent.click(radio("u2", "owner"));
    expect(screen.getByText("A project can have only one owner.")).toBeTruthy();
    fireEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.click(radio("u2", "editor"));
    fireEvent.submit(document.getElementById("project-form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rawName: "some name", roles: { u1: "owner", u2: "editor", u3: "" } }));
  });

  it("edits a project with its members' roles, removing one by giving it no access", async () => {
    const { onSave } = renderPage({
      form: {
        project: { id: "p1", name: "alpha-project", members: [{ userId: "u1", role: "owner" }, { userId: "u2", role: "viewer" }] },
        users,
      },
    });
    expect(screen.getByRole("heading", { name: "Edit Project" })).toBeTruthy();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("alpha-project");
    expect((radio("u1", "owner") as HTMLInputElement).checked).toBe(true);
    expect((radio("u2", "viewer") as HTMLInputElement).checked).toBe(true);
    expect((radio("u3", "no_access") as HTMLInputElement).checked).toBe(true);
    expect(save().hasAttribute("disabled")).toBe(false);

    fireEvent.click(radio("u2", "no_access"));
    fireEvent.click(radio("u3", "admin"));
    fireEvent.submit(document.getElementById("project-form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rawName: "alpha-project", roles: { u1: "owner", u2: "", u3: "admin" } }));
  });

  it("says a name that resolves to blank can't be blank, and shows the host's errors", async () => {
    const onSave = vi
      .fn()
      .mockRejectedValue(new RequestError("Please fix the errors below.", { fieldErrors: { owner: ["Every project must have exactly one owner. Please specify one below."] } }));
    renderPage({ form: { project: { id: "p1", name: "alpha-project", members: [{ userId: "u1", role: "owner" }] }, users }, onSave });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "!!!" } });
    expect(screen.getByText("can't be blank")).toBeTruthy();
    fireEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "alpha-project" } });
    fireEvent.submit(document.getElementById("project-form")!);
    expect(await screen.findByText("Every project must have exactly one owner. Please specify one below.")).toBeTruthy();
  });

  it("filters and sorts the member rows without losing anyone's role", async () => {
    const { onSave } = renderPage({ form: { project: { id: "p1", name: "alpha-project", members: [{ userId: "u1", role: "owner" }] }, users } });
    expect(memberNames()).toEqual(["Alice Alpha", "Bob Beta", "Charlie Gamma"]);
    const filter = screen.getByPlaceholderText("Filter users...");
    fireEvent.change(filter, { target: { value: "Alice" } });
    expect(memberNames()).toEqual(["Alice Alpha"]);
    fireEvent.change(filter, { target: { value: "owner" } });
    expect(memberNames()).toEqual(["Alice Alpha"]);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    fireEvent.click(screen.getByRole("button", { name: /NAME/ }));
    expect(memberNames()).toEqual(["Charlie Gamma", "Bob Beta", "Alice Alpha"]);
    fireEvent.click(screen.getByRole("button", { name: /OWNER/ }));
    expect(memberNames()[2]).toBe("Alice Alpha");

    fireEvent.change(filter, { target: { value: "Bob" } });
    fireEvent.click(radio("u2", "editor"));
    fireEvent.submit(document.getElementById("project-form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ rawName: "alpha-project", roles: { u1: "owner", u2: "editor", u3: "" } }));
  });

  it("links Cancel back to the list", () => {
    renderPage({ form: { project: null, users } });
    expect(screen.getByRole("link", { name: "Cancel" }).getAttribute("href")).toBe("/settings/projects");
  });
});

describe("AdminProjectsPage deletion dialog", () => {
  const deleteProject = { id: "p1", name: "alpha-project" };

  it("confirms by the project's name and says when it will go", async () => {
    const { onDelete } = renderPage({ deleteProject });
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Enter the project name to confirm deletion: alpha-project");
    expect(dialog.textContent).toContain("7 day(s) from today");
    const confirm = () => within(dialog).getByRole("button", { name: "Delete project" });
    expect(confirm().hasAttribute("disabled")).toBe(true);
    fireEvent.change(within(dialog).getByLabelText("Project name"), { target: { value: "wrong" } });
    fireEvent.blur(within(dialog).getByLabelText("Project name"));
    expect(within(dialog).getByText("doesn't match the project name")).toBeTruthy();
    fireEvent.change(within(dialog).getByLabelText("Project name"), { target: { value: "alpha-project" } });
    fireEvent.click(confirm());
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("alpha-project"));
  });

  it("keeps the dialog open with the host's reason, and closes on Cancel", async () => {
    const onDelete = vi.fn().mockRejectedValue(new RequestError("This project's deletion changed since the dialog opened. Reload the page."));
    const { onClose } = renderPage({ deleteProject, onDelete });
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Project name"), { target: { value: "alpha-project" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete project" }));
    expect(await screen.findByText(/changed since the dialog opened/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});
