import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import { ToastProvider } from "../../components/Toast";
import type { ChannelForm, ChannelRow } from "../../types/channels";
import { RequestError } from "../../utils/errors";
import ChannelsIndexPage from "./ChannelsIndexPage";

const rows: ChannelRow[] = [
  {
    id: "c1",
    name: "lab-results",
    enabled: true,
    destinationUrl: "https://destination.example.com/data",
    proxyUrl: "https://lightning.example.com/channels/c1",
    requestCount: 2,
    lastActivityAt: "2025-03-05T14:30:00Z",
    logsHref: "/projects/p1/history/channels?filters[channel_id]=c1",
  },
  {
    id: "c2",
    name: "idle",
    enabled: false,
    destinationUrl: "https://idle.example.com",
    proxyUrl: "https://lightning.example.com/channels/c2",
    requestCount: 0,
    lastActivityAt: null,
    logsHref: "/projects/p1/history/channels?filters[channel_id]=c2",
  },
];

const options = {
  credentialOptions: [{ id: "pc1", name: "My API Key" }],
  authMethodOptions: [{ id: "wam1", name: "API Key Auth" }],
};

function renderPage(props: Partial<React.ComponentProps<typeof ChannelsIndexPage>> = {}, useHref: Router["useHref"] = (to) => to) {
  const router: Router = { navigate: vi.fn(), useHref, useLocation: () => ({ pathname: "/projects/p1/channels", search: "", hash: "" }) };
  const handlers = {
    onToggle: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onSave: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <RouterProvider value={router}>
      <ToastProvider>
        <ChannelsIndexPage
          project={{ id: "p1", parentId: null, color: null }}
          projectLabel="Malawi HIV"
          channels={rows}
          totalChannels={2}
          totalRequests={2}
          logsHref="/projects/p1/history/channels"
          canCreateChannel
          canEditChannel
          canDeleteChannel
          form={null}
          {...handlers}
          {...props}
        />
      </ToastProvider>
    </RouterProvider>
  );
  return { ...handlers, router };
}

const rowOf = (name: string) => screen.getByText(name).closest("tr")!;

describe("ChannelsIndexPage", () => {
  it("lists the channels with their requests, last activity and proxy URL", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Channels (2)" })).toBeTruthy();
    const lab = rowOf("lab-results");
    expect(lab.textContent).toContain("https://destination.example.com/data");
    expect(lab.textContent).toContain("lightning.example.com/channels/c1");
    expect(lab.querySelector("a[href='/projects/p1/history/channels?filters[channel_id]=c1']")!.textContent).toBe("2");
    expect(rowOf("idle").textContent).toContain("Never");
    expect(screen.getByRole("link", { name: "View all" }).getAttribute("href")).toBe("/projects/p1/history/channels");
  });

  it("switches, opens the editor and deletes after asking", async () => {
    const { onToggle, onDelete, router } = renderPage();
    fireEvent.click(rowOf("idle").querySelector("[role=switch]")!);
    expect(onToggle).toHaveBeenCalledWith("c2", true);

    // Row actions are the small xs buttons.
    expect(within(rowOf("idle")).getByRole("button", { name: "Edit" }).className.split(" ")).toContain("py-1");
    expect(within(rowOf("idle")).getByRole("button", { name: "Delete" }).className.split(" ")).toContain("py-1");
    fireEvent.click(within(rowOf("idle")).getByRole("button", { name: "Edit" }));
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/channels/c2/edit");

    fireEvent.click(within(rowOf("idle")).getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain('Delete "idle"? This cannot be undone.');
    expect(onDelete).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("c2"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps the delete dialog open with the reason when the host refuses", async () => {
    const onDelete = vi.fn().mockRejectedValue(new RequestError("You are not authorized to perform this action."));
    renderPage({ onDelete });
    fireEvent.click(within(rowOf("idle")).getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("c2"));
    expect(await within(screen.getByRole("dialog")).findByText("You are not authorized to perform this action.")).toBeTruthy();
  });

  it("says something went wrong when a switch fails without a message", async () => {
    renderPage({ onToggle: vi.fn().mockRejectedValue(new Error("")) });
    fireEvent.click(rowOf("idle").querySelector("[role=switch]")!);
    expect(await screen.findByText("Something went wrong. Please try again.")).toBeTruthy();
  });

  it("closes the form by replacing the history entry, so Back doesn't reopen it", () => {
    const { router } = renderPage({ form: options });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/channels", { replace: true });
  });

  it("is read-only for someone who cannot edit", () => {
    renderPage({ canCreateChannel: false, canEditChannel: false, canDeleteChannel: false });
    expect((screen.getByRole("button", { name: "New Channel" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
    expect(rowOf("lab-results").textContent).toContain("Enabled");
    expect(rowOf("idle").textContent).toContain("Disabled");
    expect(screen.queryByText("Edit")).toBeNull();
    expect(screen.queryByText("Delete")).toBeNull();
  });

  it("opens the new channel form through its route", () => {
    const { router } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "New Channel" }));
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/channels/new");
  });

  it("shows the empty state, the stat cards and the form's options and links", () => {
    // A hash router, so the links must go through it to stay in the app.
    renderPage({ channels: [], totalChannels: 0, totalRequests: 0, form: options }, (to) => "#" + to);
    expect(screen.getByText("No channels found.")).toBeTruthy();
    expect(screen.getByText("Total Channels")).toBeTruthy();
    expect(screen.getByText("Total Requests")).toBeTruthy();
    expect(screen.getByPlaceholderText("https://")).toBeTruthy();
    const select = screen.getByLabelText("Destination Credential") as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => [o.text, o.value])).toEqual([
      ["None", ""],
      ["My API Key", "pc1"],
    ]);
    const links = screen.getAllByRole("link", { name: "Add New" });
    expect(links.map((a) => [a.getAttribute("href"), a.getAttribute("target")])).toEqual([
      ["#/projects/p1/settings#credentials", "_blank"],
      ["#/projects/p1/settings#webhook_security", "_blank"],
    ]);
  });

  it("saves what was entered in the new channel form; the host closes it", async () => {
    const { router, onSave } = renderPage({ form: options });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "new-channel" } });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "https://example.com/destination" } });
    fireEvent.change(screen.getByLabelText(/Destination Credential/), { target: { value: "pc1" } });
    fireEvent.click(screen.getByLabelText("API Key Auth"));
    fireEvent.submit(document.getElementById("channel-form-new")!);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: "new-channel",
        enabled: true,
        destinationUrl: "https://example.com/destination",
        destinationCredentialId: "pc1",
        clientAuthMethodIds: ["wam1"],
      })
    );
    // Closing is the host's: it owns the route the form is on.
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("keeps the form open with the host's field errors", async () => {
    const onSave = vi
      .fn()
      .mockRejectedValue(new RequestError("Please fix the errors below.", { fieldErrors: { name: ["A channel with this name already exists in this project"] } }));
    renderPage({ form: options, onSave });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "existing" } });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "https://example.com" } });
    fireEvent.submit(document.getElementById("channel-form-new")!);

    expect(await screen.findByText("A channel with this name already exists in this project")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("asks for a name and a destination before saving", async () => {
    const { onSave } = renderPage({ form: options });
    fireEvent.submit(document.getElementById("channel-form-new")!);
    expect(await screen.findAllByText("can't be blank")).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("edits a channel with its current settings and proxy URL", () => {
    const form: ChannelForm = {
      ...options,
      channel: {
        id: "c1",
        proxyUrl: "https://lightning.example.com/channels/c1",
        name: "lab-results",
        enabled: true,
        destinationUrl: "https://destination.example.com/data",
        destinationCredentialId: "pc1",
        clientAuthMethodIds: ["wam1"],
      },
    };
    renderPage({ form });
    expect(screen.getByRole("dialog").textContent).toContain("Edit Channel");
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("lab-results");
    expect((screen.getByLabelText(/Destination Credential/) as HTMLSelectElement).value).toBe("pc1");
    expect((screen.getByLabelText("API Key Auth") as HTMLInputElement).checked).toBe(true);
    expect(document.getElementById("channel-form-c1")).toBeTruthy();
    expect(screen.getByRole("dialog").textContent).toContain("lightning.example.com/channels/c1");
  });
});
