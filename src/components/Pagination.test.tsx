import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider, type Router } from "../routing/router";
import Pagination from "./Pagination";

const hashRouter = (search = ""): Router => ({
  navigate: vi.fn(),
  useHref: (to) => "#" + to,
  useLocation: () => ({ pathname: "/projects/p1/history/channels", search, hash: "" }),
});

const shown = () =>
  Array.from(screen.getByRole("navigation", { name: "Pagination" }).children, (el) => el.textContent);

describe("Pagination", () => {
  it("links pages through the router, keeping the rest of the query", () => {
    const router = hashRouter("?filters[channel_id]=c1&page=1");
    render(
      <RouterProvider value={router}>
        <Pagination page={{ number: 1, size: 10, totalEntries: 25 }} />
      </RouterProvider>
    );
    const page2 = screen.getByRole("link", { name: "2" });
    expect(page2.getAttribute("href")).toBe("#/projects/p1/history/channels?filters%5Bchannel_id%5D=c1&page=2");
    fireEvent.click(page2);
    expect(router.navigate).toHaveBeenCalledWith("/projects/p1/history/channels?filters%5Bchannel_id%5D=c1&page=2", {
      replace: false,
    });
  });

  it("shows five pages either side, then the first and last with an ellipsis between, as Lightning does", () => {
    render(
      <RouterProvider value={hashRouter()}>
        <Pagination page={{ number: 10, size: 10, totalEntries: 200 }} />
      </RouterProvider>
    );
    expect(shown()).toEqual(["Previous", "1", "…", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "…", "20", "Next"]);
    expect(screen.getByRole("link", { name: "10" }).getAttribute("aria-current")).toBe("page");
  });

  it("shows every page when they all fit in the window", () => {
    render(
      <RouterProvider value={hashRouter()}>
        <Pagination page={{ number: 7, size: 10, totalEntries: 120 }} />
      </RouterProvider>
    );
    expect(shown()).toEqual(["Previous", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Next"]);
  });
});
