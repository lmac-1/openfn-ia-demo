import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { editors } from "../../test/monaco";
import JsonViewer from "./JsonViewer";

describe("JsonViewer", () => {
  it("pretty-prints the body once, however often its parent re-renders", () => {
    const body = { x: 1, y: [true] };
    const stringify = vi.spyOn(JSON, "stringify");
    const { rerender } = render(<JsonViewer value={body} ariaLabel="Input" />);
    rerender(<JsonViewer value={body} ariaLabel="Input" />);
    rerender(<JsonViewer value={body} ariaLabel="Input" />);
    expect(stringify).toHaveBeenCalledTimes(1);
    stringify.mockRestore();

    const model = editors.at(-1)!.model;
    expect(model.getValue()).toBe(JSON.stringify(body, null, 2));
    expect(model.setValueCalls).toBe(1);
    expect(screen.getByRole("textbox", { name: "Input" })).toBeTruthy();
    expect(editors.at(-1)).toMatchObject({ theme: "default", options: { readOnly: true } });
  });

  it("copies the body", () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<JsonViewer value={'{\n  "x": 1\n}'} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
    expect(writeText).toHaveBeenCalledWith('{\n  "x": 1\n}');
  });

  it("has nothing to copy while the body is empty", () => {
    render(<JsonViewer value="" />);
    expect(screen.queryByRole("button", { name: "Copy to clipboard" })).toBeNull();
  });
});
