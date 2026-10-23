import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "../../components/Toast";
import AdminMaintenancePage from "./AdminMaintenancePage";

function renderPage(props: Partial<React.ComponentProps<typeof AdminMaintenancePage>> = {}) {
  const handlers = {
    onRefreshAdaptors: vi.fn().mockResolvedValue(undefined),
    onRefreshIcons: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <ToastProvider>
      <AdminMaintenancePage {...handlers} {...props} />
    </ToastProvider>
  );
  return handlers;
}

describe("AdminMaintenancePage", () => {
  it("offers the two actions and runs them through the host", () => {
    const { onRefreshAdaptors, onRefreshIcons } = renderPage();
    expect(screen.getByText("Refresh Adaptor Registry")).toBeTruthy();
    expect(screen.getByText("Re-fetch the list of available adaptors and their versions.")).toBeTruthy();
    expect(screen.getByText("Refresh Adaptor Icons")).toBeTruthy();

    fireEvent.click(document.getElementById("refresh-adaptors-button")!);
    expect(onRefreshAdaptors).toHaveBeenCalledTimes(1);
    fireEvent.click(document.getElementById("refresh-icons-button")!);
    expect(onRefreshIcons).toHaveBeenCalledTimes(1);
  });

  it("says so when the host refuses", async () => {
    renderPage({ onRefreshAdaptors: vi.fn().mockRejectedValue(new Error("You are not authorized to perform this action.")) });
    fireEvent.click(document.getElementById("refresh-adaptors-button")!);
    await waitFor(() => expect(screen.getByText("You are not authorized to perform this action.")).toBeTruthy());
  });

  it("says something went wrong when the refusal has no message", async () => {
    renderPage({ onRefreshIcons: vi.fn().mockRejectedValue(new Error("")) });
    fireEvent.click(document.getElementById("refresh-icons-button")!);
    expect(await screen.findByText("Something went wrong. Please try again.")).toBeTruthy();
  });
});
