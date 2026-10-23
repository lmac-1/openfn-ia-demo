import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequestError } from "./errors";
import { useForm, type FieldErrors } from "./useForm";

interface Values {
  name: string;
  email: string;
}

const initial: Values = { name: "", email: "" };

const validate = (v: Values) => {
  const errors: FieldErrors<Values> = {};
  if (!v.name) errors.name = ["can't be blank"];
  if (!v.email) errors.email = ["can't be blank"];
  return errors;
};

const setup = () => renderHook(() => useForm({ initial, validate }));

describe("useForm", () => {
  it("shows a field's client errors once it has been blurred", () => {
    const { result } = setup();
    expect(result.current.errors.name).toEqual([]);

    act(() => result.current.fieldProps("name").onBlur());
    expect(result.current.errors.name).toEqual(["can't be blank"]);
    expect(result.current.errors.email).toEqual([]);
  });

  it("shows every field's client errors after submit", () => {
    const { result } = setup();
    const save = vi.fn();

    act(() => result.current.submit(save)());
    expect(result.current.errors).toEqual({ name: ["can't be blank"], email: ["can't be blank"] });
    expect(save).not.toHaveBeenCalled();
  });

  it("puts a RequestError's field errors on the field, and clears them when it changes", async () => {
    const { result } = setup();
    act(() => {
      result.current.set("name", "Ada");
      result.current.set("email", "ada@example.com");
    });

    // submit() doesn't return the save's promise, so wait for its result.
    act(() => result.current.submit(() => Promise.reject(new RequestError("Invalid", { fieldErrors: { email: ["has already been taken"] } })))());
    await waitFor(() => expect(result.current.errors.email).toEqual(["has already been taken"]));
    expect(result.current.error).toBeNull();

    act(() => result.current.set("email", "ada@example.org"));
    expect(result.current.errors.email).toEqual([]);
  });

  it("makes the submitted values the saved ones after a successful submit", async () => {
    const { result } = setup();
    act(() => {
      result.current.set("name", "Ada");
      result.current.set("email", "ada@example.com");
    });
    expect(result.current.dirty).toBe(true);

    act(() => result.current.submit(() => Promise.resolve())());
    await waitFor(() => expect(result.current.dirty).toBe(false));
    expect(result.current.values).toEqual({ name: "Ada", email: "ada@example.com" });
  });

  it("keeps the edited values and sets error after a failed save", async () => {
    const { result } = setup();
    act(() => {
      result.current.set("name", "Ada");
      result.current.set("email", "ada@example.com");
    });

    act(() => result.current.submit(() => Promise.reject(new Error("Server down")))());
    await waitFor(() => expect(result.current.error?.message).toBe("Server down"));
    expect(result.current.dirty).toBe(true);
    expect(result.current.values.name).toBe("Ada");
  });

  it("modalSubmit doesn't call save when the form is invalid", async () => {
    const { result } = setup();
    const save = vi.fn();

    await act(() => result.current.modalSubmit(save)());
    expect(save).not.toHaveBeenCalled();
    expect(result.current.errors.name).toEqual(["can't be blank"]);
  });
});
