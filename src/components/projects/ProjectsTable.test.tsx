import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProjectOverview } from "../../types/workflows";
import ProjectsTable from "./ProjectsTable";

// What DashboardLive's server-side sort did; the table sorts in the browser now.
const projects: ProjectOverview[] = [
  { id: "b", name: "Bravo", role: "admin", workflowsCount: 1, collaboratorsCount: 1, lastUpdatedAt: "2026-10-03T10:00:00Z" },
  { id: "c", name: "Charlie", role: "admin", workflowsCount: 1, collaboratorsCount: 1, lastUpdatedAt: null },
  { id: "a", name: "Alpha", role: "admin", workflowsCount: 1, collaboratorsCount: 1, lastUpdatedAt: "2026-10-01T10:00:00Z" },
];

const names = () => screen.getAllByRole("row").slice(1).map((tr) => tr.querySelector("td")?.textContent);

describe("ProjectsTable", () => {
  it("sorts by name ascending first, and flips on a second click", () => {
    render(<ProjectsTable projects={projects} />);
    expect(names()).toEqual(["Alpha", "Bravo", "Charlie"]);

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(names()).toEqual(["Charlie", "Bravo", "Alpha"]);

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(names()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("sorts by last activity, with projects that have none first, then flips", () => {
    render(<ProjectsTable projects={projects} />);

    fireEvent.click(screen.getByRole("button", { name: /Last Updated/ }));
    expect(names()).toEqual(["Charlie", "Alpha", "Bravo"]);

    fireEvent.click(screen.getByRole("button", { name: /Last Updated/ }));
    expect(names()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });
});
