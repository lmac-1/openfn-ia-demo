import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestError } from "../../utils/errors";
import AuthConfirmationRequiredPage from "./AuthConfirmationRequiredPage";

function renderPage(props: Partial<React.ComponentProps<typeof AuthConfirmationRequiredPage>> = {}) {
  const handlers = {
    onResend: vi.fn().mockResolvedValue({ status: "sent" }),
    onChangeEmail: vi.fn().mockResolvedValue({ status: "requested", email: "typo-fixed@example.com" }),
  };
  render(<AuthConfirmationRequiredPage email="una@example.org" logoutTo="/users/log_out" {...handlers} {...props} />);
  return handlers;
}

const resend = () => screen.getByRole("button", { name: "Resend confirmation email" });
const update = () => screen.getByRole("button", { name: "Update email" });
// The labels carry the required mark, so match on their text.
const emailField = () => screen.getByLabelText(/New email address/) as HTMLInputElement;
const passwordField = () => screen.getByLabelText(/Enter password to confirm/) as HTMLInputElement;
const fill = (email: string, password: string) => {
  fireEvent.change(emailField(), { target: { value: email } });
  fireEvent.change(passwordField(), { target: { value: password } });
};

describe("AuthConfirmationRequiredPage", () => {
  it("explains the block for the address and offers every way out", () => {
    renderPage();
    expect(screen.getByText("Confirm your email address")).toBeTruthy();
    expect(screen.getByText(/blocked pending email confirmation/).textContent).toContain("una@example.org");
    expect(resend()).toBeTruthy();
    expect(document.getElementById("email-form")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Log out" }).getAttribute("href")).toBe("/users/log_out");
  });

  it("says a new link was sent, and stays enabled for another", async () => {
    const { onResend } = renderPage();
    expect(document.getElementById("confirmation-email-sent")).toBeNull();
    fireEvent.click(resend());
    expect(await screen.findByText("We have sent a new confirmation link to una@example.org.")).toBeTruthy();
    expect(onResend).toHaveBeenCalledTimes(1);
    expect(resend().hasAttribute("disabled")).toBe(false);
  });

  it("shows the host's throttle message in place of the sent one, and a failure", async () => {
    const onResend = vi
      .fn()
      .mockResolvedValueOnce({ status: "sent" })
      .mockResolvedValueOnce({ status: "throttled", message: "You've asked for this a few times recently; you can request another in a few minutes." })
      .mockResolvedValueOnce({ status: "failed" });
    renderPage({ onResend });
    fireEvent.click(resend());
    await screen.findByText(/We have sent a new confirmation link/);
    fireEvent.click(resend());
    expect(await screen.findByText(/you can request another in a few minutes/)).toBeTruthy();
    expect(screen.queryByText(/We have sent a new confirmation link/)).toBeNull();
    fireEvent.click(resend());
    expect(await screen.findByText(/We could not send that email just now/)).toBeTruthy();
  });

  it("needs a different, well-formed address and a password before it will ask", () => {
    renderPage();
    expect(update().hasAttribute("disabled")).toBe(true);
    fill("una@example.org", "secret");
    expect(update().hasAttribute("disabled")).toBe(true);
    fill("not an email", "secret");
    expect(update().hasAttribute("disabled")).toBe(true);
    fill("typo-fixed@example.com", "");
    expect(update().hasAttribute("disabled")).toBe(true);
    fill("typo-fixed@example.com", "secret");
    expect(update().hasAttribute("disabled")).toBe(false);
  });

  it("asks with the address and password, then says where the instructions went and forgets the password", async () => {
    const { onChangeEmail } = renderPage();
    fill("typo-fixed@example.com", "hello world!");
    fireEvent.submit(document.getElementById("email-form")!);
    await waitFor(() => expect(onChangeEmail).toHaveBeenCalledWith({ email: "typo-fixed@example.com", currentPassword: "hello world!" }));
    expect(await screen.findByText("We have sent confirmation instructions to typo-fixed@example.com.")).toBeTruthy();
    expect(passwordField().value).toBe("");
  });

  it("puts a wrong password on its field, and drops an earlier answer", async () => {
    const onChangeEmail = vi
      .fn()
      .mockResolvedValueOnce({ status: "requested", email: "first@example.com" })
      .mockRejectedValueOnce(new RequestError("Please fix the errors below.", { fieldErrors: { currentPassword: ["Your passwords do not match."] } }));
    renderPage({ onChangeEmail });
    fill("first@example.com", "hello world!");
    fireEvent.submit(document.getElementById("email-form")!);
    await screen.findByText(/We have sent confirmation instructions/);

    fill("typo-fixed@example.com", "wrong");
    fireEvent.submit(document.getElementById("email-form")!);
    expect(await screen.findByText("Your passwords do not match.")).toBeTruthy();
    expect(screen.queryByText(/We have sent confirmation instructions/)).toBeNull();
  });

  it("tells a request that never answered apart from one the host could not send", async () => {
    const onResend = vi.fn().mockRejectedValue(new RequestError("Connection lost. Please try again."));
    renderPage({ onResend });
    fireEvent.click(resend());
    expect(await screen.findByText("Connection lost. Please try again.")).toBeTruthy();
    expect(screen.queryByText(/We could not send that email just now/)).toBeNull();
  });

  it("says when corrections are throttled, keeping the typed address", async () => {
    const onChangeEmail = vi.fn().mockResolvedValue({ status: "throttled" });
    renderPage({ onChangeEmail });
    fill("typo-fixed-4@example.com", "hello world!");
    fireEvent.submit(document.getElementById("email-form")!);
    expect(await screen.findByText(/asked us to change this address a few times recently/)).toBeTruthy();
    expect(screen.queryByText(/We have sent confirmation instructions/)).toBeNull();
    expect(emailField().value).toBe("typo-fixed-4@example.com");
  });
});
