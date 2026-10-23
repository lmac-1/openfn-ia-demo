import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminUserRow } from "../../types/admin";
import { RequestError } from "../../utils/errors";
import AdminUserEditPage from "./AdminUserEditPage";

const amara: AdminUserRow = { id: "u1", firstName: "Amara", lastName: "Okafor", email: "amara@example.org", role: "user", supportUser: false, disabled: false, scheduledDeletion: null };
const root: AdminUserRow = { ...amara, id: "u2", firstName: "Root", email: "root@example.org", role: "superuser" };

function renderPage(props: Partial<React.ComponentProps<typeof AdminUserEditPage>> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<AdminUserEditPage user={null} onSave={onSave} {...props} />);
  return { onSave };
}

const save = () => screen.getByRole("button", { name: "Save" });
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });

describe("AdminUserEditPage", () => {
  it("creates an account once every required field is filled, sending what the form holds", async () => {
    const { onSave } = renderPage();
    expect(screen.getByRole("heading", { name: "New User" })).toBeTruthy();
    expect(screen.queryByLabelText("Scheduled Deletion")).toBeNull();

    type("First Name", "Amara");
    type("Last Name", "Okafor");
    type("Email", "amara@example.org");
    type("Password", "a long enough password");

    fireEvent.click(save());
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        firstName: "Amara",
        lastName: "Okafor",
        email: "amara@example.org",
        password: "a long enough password",
        role: "user",
        supportUser: false,
        scheduledDeletion: "",
        disabled: false,
      })
    );
  });

  it("edits an account with its current values and sends an empty password to keep the current one", async () => {
    const { onSave } = renderPage({ user: amara });
    expect(screen.getByRole("heading", { name: "Edit User" })).toBeTruthy();
    expect(field("Email").value).toBe("amara@example.org");
    expect(save().hasAttribute("disabled")).toBe(false);
    type("Last Name", "Okafor-Bello");
    fireEvent.submit(document.getElementById("user-form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ lastName: "Okafor-Bello", password: "", disabled: false })));
  });

  it("keeps Save enabled while fields are invalid, and pressing it shows each error without saving", async () => {
    const { onSave } = renderPage();
    type("Password", "short");
    expect(save().hasAttribute("disabled")).toBe(false);

    fireEvent.click(save());

    expect(await screen.findAllByText("can't be blank")).toHaveLength(3);
    expect(screen.getByText("Password minimum length is 12 characters.")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("puts the host's field errors on their fields", async () => {
    const onSave = vi.fn().mockRejectedValue(new RequestError("Please fix the errors below.", { fieldErrors: { email: ["has already been taken"] } }));
    renderPage({ user: amara, onSave });
    fireEvent.submit(document.getElementById("user-form")!);
    expect(await screen.findByText("has already been taken")).toBeTruthy();
  });

  it("warns how far support access reaches when it is turned on", () => {
    renderPage({ user: amara });
    expect(screen.queryByText("Heads Up!")).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: "Support User" }));
    expect(screen.getByText("This user will be able to access ALL projects that have support access enabled")).toBeTruthy();
  });

  it("offers Scheduled Deletion only while the role is User", () => {
    renderPage({ user: amara });
    expect(screen.getByLabelText("Scheduled Deletion")).toBeTruthy();
    type("Role", "superuser");
    expect(screen.queryByLabelText("Scheduled Deletion")).toBeNull();
    type("Role", "user");
    expect(screen.getByLabelText("Scheduled Deletion")).toBeTruthy();
  });

  it("does not offer Scheduled Deletion for a superuser", () => {
    renderPage({ user: root });
    expect(screen.queryByLabelText("Scheduled Deletion")).toBeNull();
    expect(screen.getByLabelText("A disabled user will not be allowed to login.")).toBeTruthy();
  });

  it("links Cancel back to the list", () => {
    renderPage({ user: amara });
    expect(screen.getByRole("link", { name: "Cancel" }).getAttribute("href")).toBe("/settings/users");
  });
});
