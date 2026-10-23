import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Toggle from "./Toggle";

describe("Toggle", () => {
  it("keeps a disabled switch's reason on hover, through a wrapper that still gets pointer events", () => {
    render(<Toggle checked={false} disabled label="Require MFA?" tooltip="You do not have permission to change this." />);
    const button = screen.getByRole("switch", { name: "Require MFA?" });
    expect(button.getAttribute("title")).toBe("You do not have permission to change this.");
    expect(button.parentElement!.tagName).toBe("SPAN");
  });

  it("leaves an enabled switch's tooltip to the Tooltip, with no title box on top", () => {
    render(<Toggle checked={false} label="Disable workflow" tooltip="Turns off every trigger." />);
    expect(screen.getByRole("switch", { name: "Disable workflow" }).hasAttribute("title")).toBe(false);
  });
});
