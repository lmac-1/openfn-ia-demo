import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthProvider } from "../../types/admin";
import { RequestError } from "../../utils/errors";
import AdminAuthProvidersPage from "./AdminAuthProvidersPage";

const blank: AuthProvider = {
  id: null,
  name: "",
  discoveryUrl: "",
  clientId: "",
  hasClientSecret: false,
  redirectHost: "http://localhost:4000",
  allowUnverifiedEmail: false,
};

const existing: AuthProvider = {
  id: "ap1",
  name: "google",
  discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
  clientId: "client-id",
  hasClientSecret: true,
  redirectHost: "http://localhost:4000",
  allowUnverifiedEmail: false,
};

function renderPage(props: Partial<React.ComponentProps<typeof AdminAuthProvidersPage>> = {}) {
  const handlers = {
    onSave: vi.fn().mockResolvedValue(undefined),
    onTest: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn().mockResolvedValue(undefined),
  };
  render(<AdminAuthProvidersPage provider={blank} {...handlers} {...props} />);
  return handlers;
}

const save = () => screen.getByRole("button", { name: "Save" });
// Labels may carry a hint, so match on their text.
const field = (label: string) => screen.getByLabelText(new RegExp(label)) as HTMLInputElement;
const type = (label: string, value: string) => fireEvent.change(field(label), { target: { value } });
const fillAll = () => {
  type("Name", "google");
  type("Discovery URL", "https://accounts.google.com/.well-known/openid-configuration");
  type("Client ID", "client-id");
  type("Client Secret", "s3cret");
};

describe("AdminAuthProvidersPage", () => {
  it("starts blank with no Test and no Remove, and previews the host", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Authentication" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Test" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove" })).toBeNull();
    expect(document.getElementById("redirect-uri-preview")!.textContent).toBe("http://localhost:4000…");
    expect(field("Trust unverified emails from this provider").checked).toBe(false);
  });

  it("keeps Save enabled, and pressing it on a blank form says what is missing without saving", () => {
    const { onSave } = renderPage();
    expect(save().hasAttribute("disabled")).toBe(false);
    fireEvent.click(save());
    expect(screen.getAllByText("can't be blank")).toHaveLength(4);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("offers Test once every field is filled, and previews the redirect URI", async () => {
    const { onSave } = renderPage();
    fillAll();
    expect(screen.getByRole("button", { name: "Test" })).toBeTruthy();
    expect(document.getElementById("redirect-uri-preview")!.textContent).toBe("http://localhost:4000/authenticate/google/callback");

    fireEvent.click(field("Trust unverified emails from this provider"));
    fireEvent.submit(document.getElementById("auth-provider-form")!);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: "google",
        discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
        clientId: "client-id",
        clientSecret: "s3cret",
        redirectHost: "http://localhost:4000",
        allowUnverifiedEmail: true,
      })
    );
  });

  it("shows a passing test, a failing one with its reason, and forgets both on an edit", async () => {
    const onTest = vi.fn().mockRejectedValueOnce(new RequestError("error parsing .well-known")).mockResolvedValue(undefined);
    renderPage({ onTest });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(await screen.findByRole("button", { name: "Failed" })).toBeTruthy();
    expect(screen.getByText("error parsing .well-known")).toBeTruthy();

    type("Discovery URL", "https://accounts.google.com/.well-known/openid-configuration2");
    expect(screen.queryByText("error parsing .well-known")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(await screen.findByRole("button", { name: "Success" })).toBeTruthy();
    expect(onTest).toHaveBeenCalledTimes(2);

    type("Client ID", "other");
    expect(screen.getByRole("button", { name: "Test" })).toBeTruthy();
  });

  it("edits an existing provider without its secret, which may be left blank", async () => {
    const { onSave, onRemove } = renderPage({ provider: existing });
    expect(field("Name").value).toBe("google");
    expect(field("Client Secret").value).toBe("");
    expect(field("Client Secret").getAttribute("placeholder")).toContain("keep the current secret");
    expect(save().hasAttribute("disabled")).toBe(false);

    type("Client ID", "new-client-id");
    type("Redirect Host", "http://localhost:3030");
    expect(document.getElementById("redirect-uri-preview")!.textContent).toBe("http://localhost:3030/authenticate/google/callback");
    fireEvent.submit(document.getElementById("auth-provider-form")!);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ clientId: "new-client-id", clientSecret: "" })));

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onRemove).toHaveBeenCalled());
  });

  it("says what the host would refuse, and Save sends nothing until it is fixed", () => {
    const { onSave } = renderPage();
    fillAll();
    type("Name", "Not Lower");
    expect(screen.getByText(/must be lower-case/)).toBeTruthy();
    fireEvent.click(save());
    expect(onSave).not.toHaveBeenCalled();
    type("Name", "google");
    type("Discovery URL", "acme");
    expect(screen.getByText("must be a valid HTTP/s URL")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Test" })).toBeNull();
  });

  it("shows a refused save or remove in a danger alert", async () => {
    renderPage({
      provider: existing,
      onSave: vi.fn().mockRejectedValue(new RequestError("Could not reach the provider.")),
      onRemove: vi.fn().mockRejectedValue(new RequestError("You are not authorized to perform this action.")),
    });
    fireEvent.submit(document.getElementById("auth-provider-form")!);
    const saveAlert = await screen.findByText("Could not reach the provider.");
    expect(saveAlert.closest("[data-ui=alert]")!.getAttribute("data-variant")).toBe("danger");
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    const removeAlert = await screen.findByText("You are not authorized to perform this action.");
    expect(removeAlert.closest("[data-ui=alert]")!.getAttribute("data-variant")).toBe("danger");
  });

  it("puts the host's field errors on their fields", async () => {
    const onSave = vi.fn().mockRejectedValue(
      new RequestError("Please fix the errors below.", {
        fieldErrors: { name: ["must be lower-case and only contain alphanumeric, dash and underscore characters"] },
      })
    );
    renderPage({ provider: existing, onSave });
    type("Name", "Google");
    fireEvent.submit(document.getElementById("auth-provider-form")!);
    expect(await screen.findByText(/must be lower-case/)).toBeTruthy();
  });
});
