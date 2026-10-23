import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../components/Toast";
import type { AdminCollectionRow } from "../../types/admin";
import { RequestError } from "../../utils/errors";
import AdminCollectionsPage from "./AdminCollectionsPage";

const rows: AdminCollectionRow[] = [
  { id: "c1", name: "patients", projectId: "p1", projectName: "Malawi HIV", byteSizeSum: 2_500_000 },
  { id: "c2", name: "visits", projectId: "p2", projectName: "Kenya TB", byteSizeSum: 100 },
];
const projectOptions: [string, string][] = [
  ["Kenya TB", "p2"],
  ["Malawi HIV", "p1"],
];

const names = () =>
  Array.from(document.querySelectorAll("#collections-table tbody tr td:first-child")).map((td) => td.textContent?.trim());

function renderPage(props: Partial<React.ComponentProps<typeof AdminCollectionsPage>> = {}) {
  const handlers = {
    onCreate: vi.fn().mockResolvedValue(undefined),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <ToastProvider>
      <AdminCollectionsPage collections={rows} projectOptions={projectOptions} {...handlers} {...props} />
    </ToastProvider>
  );
  return handlers;
}

describe("AdminCollectionsPage", () => {
  it("lists every collection with its project and storage, sorted by name, and sorts by storage on click", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Collections (2)" })).toBeTruthy();
    expect(names()).toEqual(["patients", "visits"]);
    const patients = screen.getByText("patients").closest("tr")!;
    expect(patients.textContent).toContain("Malawi HIV");
    expect(patients.textContent).toContain("2.5 MB");
    expect(screen.getByText("visits").closest("tr")!.textContent).toContain("100 B");

    fireEvent.click(screen.getByRole("button", { name: /Used storage/ }));
    expect(names()).toEqual(["visits", "patients"]);
    fireEvent.click(screen.getByRole("button", { name: /Used storage/ }));
    expect(names()).toEqual(["patients", "visits"]);
  });

  it("offers to create the first collection when there are none", () => {
    renderPage({ collections: [] });
    expect(screen.getByText("No collection found.")).toBeTruthy();
    fireEvent.click(document.getElementById("open-create-collection-modal-big-buttton")!);
    expect(screen.getByRole("dialog").textContent).toContain("Create Collection");
  });

  it("creates a collection with the name as typed and the chosen project, then closes", async () => {
    const { onCreate } = renderPage();
    fireEvent.click(document.getElementById("open-create-collection-modal-button")!);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "New Collection" } });
    expect(screen.getByRole("dialog").textContent).toContain("new-collection");
    fireEvent.change(screen.getByLabelText(/Project/), { target: { value: "p1" } });
    fireEvent.submit(document.getElementById("collection-form-new")!);

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ rawName: "New Collection", projectId: "p1" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("cancels the create form without saving", async () => {
    const { onCreate } = renderPage();
    fireEvent.click(document.getElementById("open-create-collection-modal-button")!);
    fireEvent.click(document.getElementById("cancel-collection-creation-new")!);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("edits a collection with its current name and project, and keeps the form open on a refusal", async () => {
    const onUpdate = vi
      .fn()
      .mockRejectedValue(new RequestError("Please fix the errors below.", { fieldErrors: { rawName: ["A collection with this name already exists"] } }));
    renderPage({ onUpdate });
    fireEvent.click(document.getElementById("edit-collection-c1-button")!);
    expect((screen.getByLabelText(/Name/) as HTMLInputElement).value).toBe("patients");
    expect((screen.getByLabelText(/Project/) as HTMLSelectElement).value).toBe("p1");
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "visits" } });
    fireEvent.submit(document.getElementById("collection-form-c1")!);

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith("c1", { rawName: "visits", projectId: "p1" }));
    expect(await screen.findByText("A collection with this name already exists")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("deletes a collection after confirming", async () => {
    const { onDelete } = renderPage();
    fireEvent.click(document.getElementById("delete-collection-c2-button")!);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Are you sure you want to delete the collection");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("c2"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
