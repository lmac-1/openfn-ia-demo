import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../../routing/router";
import type { ChannelLogRow } from "../../types/channels";
import HistoryChannelLogsPage from "./HistoryChannelLogsPage";

const channels = [
  { id: "c1", name: "channel-one" },
  { id: "c2", name: "channel-two" },
];

const rows: ChannelLogRow[] = [
  {
    id: "r1",
    requestId: "c81d3e5a-77f2-4c0b-a1e9-3b6f0d2c9e14",
    channelId: "c1",
    channelName: "channel-one",
    startedAt: "2026-10-14T09:31:12Z",
    state: "success",
    requestPath: "/some/upstream/path",
    errorMessage: null,
  },
  {
    id: "r2",
    requestId: "d92e4f6b-88a3-4d1c-b2fa-4c7a1e3d0f25",
    channelId: "c2",
    channelName: "channel-two",
    startedAt: "2026-10-14T09:30:00Z",
    state: "error",
    requestPath: null,
    errorMessage: "econnrefused",
  },
];

function renderPage(props: Partial<React.ComponentProps<typeof HistoryChannelLogsPage>> = {}, search = "") {
  const router: Router = { navigate: vi.fn(), useHref: (to) => to, useLocation: () => ({ pathname: "/projects/p1/history/channels", search, hash: "" }) };
  render(
    <RouterProvider value={router}>
      <HistoryChannelLogsPage
        project={{ id: "p1", parentId: null, color: null }}
        projectLabel="Malawi HIV"
        channelsEnabled
        channels={channels}
        channelId={null}
        rows={rows}
        page={{ number: 1, size: 10, totalEntries: 2 }}
        {...props}
      />
    </RouterProvider>
  );
  return router;
}

const rowOf = (id: string) => document.getElementById(`request-${id}`)!;

describe("HistoryChannelLogsPage", () => {
  it("lists the page's requests with their id, path, channel, state and error", () => {
    renderPage();
    expect(screen.getByRole("tab", { name: "Channel Logs" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Work Orders" }).getAttribute("href")).toBe("/projects/p1/history");
    expect(document.querySelectorAll("#channel-requests-table thead th")[1]!.textContent).toBe("Request Path");

    const first = rowOf("r1");
    expect(within(first).getByRole("link", { name: "c81d3e5a" }).getAttribute("href")).toBe("/projects/p1/history/channels/r1");
    expect(first.querySelectorAll("td")[1]!.textContent).toBe("/some/upstream/path");
    expect(within(first).getByRole("link", { name: "channel-one" }).getAttribute("href")).toBe("/projects/p1/history/channels?filters[channel_id]=c1");
    expect(first.textContent).toContain("Success");

    const second = rowOf("r2");
    expect(second.querySelectorAll("td")[1]!.textContent).toBe("—");
    expect(second.textContent).toContain("econnrefused");
    expect(screen.getByText(/Showing/).textContent).toContain("1 to 2 of 2");
  });

  it("hides the tab bar without experimental features", () => {
    renderPage({ channelsEnabled: false });
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("shows the empty state", () => {
    renderPage({ rows: [], page: { number: 1, size: 10, totalEntries: 0 } });
    expect(screen.getByText("No channel requests found.")).toBeTruthy();
  });

  it("filters by channel through the URL, names the filter, and clears it", async () => {
    const router = renderPage({ channelId: "c1", rows: [rows[0]!], page: { number: 1, size: 10, totalEntries: 1 } });
    const chip = document.getElementById("channel-filter-chip")!;
    expect(chip.textContent).toContain("Channel is channel-one");

    await userEvent.click(within(chip).getByRole("button", { name: /Channel is/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "channel-two" }));
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/history/channels?filters%5Bchannel_id%5D=c2");

    fireEvent.click(within(chip).getByRole("button", { name: /clear/i }));
    expect(router.navigate).toHaveBeenLastCalledWith("/projects/p1/history/channels");
  });

  it("says the filter is any when the URL names a channel this project does not have", () => {
    renderPage({ channelId: "nope" });
    expect(document.getElementById("channel-filter-chip")!.textContent).toContain("Channel is any");
  });

  it("pages through the URL, keeping the filter", () => {
    renderPage({ channelId: "c1", page: { number: 1, size: 10, totalEntries: 25 } }, "?filters[channel_id]=c1");
    expect(screen.getByRole("link", { name: "2" }).getAttribute("href")).toBe("/projects/p1/history/channels?filters%5Bchannel_id%5D=c1&page=2");
  });
});
