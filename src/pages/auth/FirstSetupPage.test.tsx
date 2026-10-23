import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestError } from "../../utils/errors";
import FirstSetupPage from "./FirstSetupPage";

const fill = (id: string, value: string) => fireEvent.change(document.getElementById(id)!, { target: { value } });
const submit = () => fireEvent.submit(document.getElementById("superuser-registration-form")!);

function renderPage(onSave = vi.fn().mockResolvedValue(undefined)) {
  render(<FirstSetupPage onSave={onSave} />);
  return onSave;
}

describe("FirstSetupPage", () => {
  it("flags a mismatched confirmation and a short password before saving", async () => {
    const onSave = renderPage();
    expect(screen.getByText("Setup")).toBeTruthy();
    fill("password", "123");
    submit();
    expect(await screen.findByText("does not match confirmation")).toBeTruthy();
    expect(screen.getByText("Password minimum length is 12 characters.")).toBeTruthy();
    expect(screen.getAllByText("can't be blank")).toHaveLength(3);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("flags an email that isn't one before saving", async () => {
    const onSave = renderPage();
    fill("email", "admin");
    submit();
    expect(await screen.findByText("must be a valid email address")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves the five fields through the host", async () => {
    const onSave = renderPage();
    fill("first_name", "Test");
    fill("last_name", "McTest");
    fill("email", "foo@example.com");
    fill("password", "1234567890ab");
    fill("password_confirmation", "1234567890ab");
    submit();
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        firstName: "Test",
        lastName: "McTest",
        email: "foo@example.com",
        password: "1234567890ab",
        passwordConfirmation: "1234567890ab",
      })
    );
  });

  it("shows the host's field errors on their fields", async () => {
    renderPage(
      vi.fn().mockRejectedValue(new RequestError("Please fix the errors below.", { fieldErrors: { email: ["has already been taken"] } }))
    );
    fill("first_name", "Test");
    fill("last_name", "McTest");
    fill("email", "taken@example.com");
    fill("password", "1234567890ab");
    fill("password_confirmation", "1234567890ab");
    submit();
    expect(await screen.findByText("has already been taken")).toBeTruthy();
  });
});
