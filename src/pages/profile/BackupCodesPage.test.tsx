import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../components/Toast";
import BackupCodesPage from "./BackupCodesPage";

const codes = [
  { code: "aaaa1111", usedAt: null },
  { code: "bbbb2222", usedAt: "2026-09-18T10:41:07Z" },
];

function renderPage(props: Partial<React.ComponentProps<typeof BackupCodesPage>> = {}) {
  const onRegenerate = vi.fn().mockResolvedValue(undefined);
  const onPrint = vi.fn();
  render(
    <ToastProvider>
      <BackupCodesPage codes={codes} mfaEnabled onRegenerate={onRegenerate} onPrint={onPrint} {...props} />
    </ToastProvider>
  );
  return { onRegenerate, onPrint };
}

describe("BackupCodesPage", () => {
  it("shows the codes it is given, used ones struck through", () => {
    renderPage();
    expect(screen.getByText("aaaa1111")).toBeTruthy();
    expect(screen.getByText("bbbb2222").className).toContain("line-through");
    expect(screen.queryByText("MFA Disabled")).toBeNull();
  });

  it("asks the host to regenerate and to print", () => {
    const { onRegenerate, onPrint } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Generate new backup codes" }));
    fireEvent.click(screen.getByRole("button", { name: "Print Codes" }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it("shows the MFA notice when MFA is off", () => {
    renderPage({ mfaEnabled: false });
    expect(screen.getByText("MFA Disabled")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to profile" })).toBeTruthy();
  });
});
