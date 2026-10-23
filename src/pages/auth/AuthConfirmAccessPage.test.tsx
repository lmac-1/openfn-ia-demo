import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthConfirmAccessPage from "./AuthConfirmAccessPage";

function renderPage(props: Partial<React.ComponentProps<typeof AuthConfirmAccessPage>> = {}) {
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  render(<AuthConfirmAccessPage user={{ firstName: "Amara", lastName: "Diallo", mfaEnabled: true }} onConfirm={onConfirm} {...props} />);
  return { onConfirm };
}

const submit = () => fireEvent.submit(document.getElementById("reauthentication-form")!);

describe("AuthConfirmAccessPage", () => {
  it("shows who is signed in and asks for the password by default", () => {
    renderPage();
    expect(screen.getByText("Confirm access")).toBeTruthy();
    expect(screen.getByText("Amara Diallo")).toBeTruthy();
    expect(screen.getByText("AD")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
    expect(document.getElementById("user_password")).toBeTruthy();
    expect(screen.getByText("Enter your password to confirm access")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
    expect(screen.queryByText("Authentication Code")).toBeNull();
  });

  it("confirms with the password and shows a refusal", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Invalid password! Try again."));
    renderPage({ onConfirm });
    fireEvent.change(document.getElementById("user_password")!, { target: { value: "wrong" } });
    submit();
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ password: "wrong" }));
    expect(await screen.findByText("Invalid password! Try again.")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
  });

  it("lets a user with MFA switch to the authenticator code and back", async () => {
    const { onConfirm } = renderPage();
    fireEvent.click(screen.getByText("Use your authenticator app instead"));
    expect(screen.getByText("Authentication Code")).toBeTruthy();
    expect(screen.getByText(/Open your two-factor authenticator/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Verify" })).toBeTruthy();
    expect(screen.queryByText("Use your authenticator app instead")).toBeNull();

    fireEvent.change(document.getElementById("user_code")!, { target: { value: "123456" } });
    submit();
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith({ code: "123456" }));

    fireEvent.click(screen.getByText("Use your password instead"));
    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByText("Use your authenticator app instead")).toBeTruthy();
  });

  it("offers no authenticator option without MFA", () => {
    renderPage({ user: { firstName: "Amara", lastName: "Diallo", mfaEnabled: false } });
    expect(screen.queryByText("Use your authenticator app instead")).toBeNull();
  });
});
