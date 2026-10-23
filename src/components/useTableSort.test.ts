import { describe, expect, it } from "vitest";
import { compareBy, type SortValue } from "./useTableSort";

type Row = { name: string; at?: SortValue };

const sorted = (rows: Row[], direction: "asc" | "desc", nulls?: "first" | "last") =>
  [...rows].sort(compareBy((r) => r.at ?? null, direction, nulls)).map((r) => r.name);

// The cases Lightning's TableHelpers.sort_items was pinned to, now that the
// admin tables sort in the browser.
describe("compareBy", () => {
  it("sorts timestamps chronologically across a month boundary", () => {
    const rows = [
      { name: "April", at: "2026-04-30T23:10:00Z" },
      { name: "May", at: "2026-05-01T01:10:00Z" },
      { name: "Earlier", at: "2026-04-30T21:10:00Z" },
    ];
    expect(sorted(rows, "asc")).toEqual(["Earlier", "April", "May"]);
    expect(sorted(rows, "desc")).toEqual(["May", "April", "Earlier"]);
  });

  it("sorts dates and times chronologically", () => {
    expect(sorted([{ name: "April", at: "2026-04-30" }, { name: "May", at: "2026-05-01" }], "desc")).toEqual(["May", "April"]);
    expect(sorted([{ name: "Late", at: "23:10:00" }, { name: "Early", at: "01:10:00" }], "asc")).toEqual(["Early", "Late"]);
  });

  it("puts empty values lowest by default, or last when asked", () => {
    const rows = [{ name: "Has", at: "2026-05-01T00:00:00Z" }, { name: "Nil", at: null }, { name: "Missing" }];
    expect(sorted(rows, "asc").at(-1)).toBe("Has");
    expect(sorted(rows, "asc", "last")[0]).toBe("Has");
  });

  it("keeps an empty value apart from a real 1970-01-01 timestamp", () => {
    const rows = [{ name: "Epoch", at: "1970-01-01T00:00:00Z" }, { name: "Nil", at: null }];
    expect(sorted(rows, "asc")).toEqual(["Nil", "Epoch"]);
    expect(sorted(rows, "desc")).toEqual(["Epoch", "Nil"]);
  });

  it("sorts numbers by value and true after false", () => {
    const counts = [{ name: "2", at: 2 }, { name: "10", at: 10 }, { name: "1", at: 1 }];
    expect(sorted(counts, "asc")).toEqual(["1", "2", "10"]);
    expect(sorted(counts, "desc")).toEqual(["10", "2", "1"]);
    const flags = [{ name: "yes", at: true }, { name: "no", at: false }];
    expect(sorted(flags, "asc")).toEqual(["no", "yes"]);
    expect(sorted(flags, "desc")).toEqual(["yes", "no"]);
  });

  it("sorts strings alphabetically, either way, and leaves ties in order", () => {
    const rows = [{ name: "b", at: "Bob" }, { name: "a", at: "Alice" }, { name: "c", at: "Charlie" }];
    expect(sorted(rows, "asc")).toEqual(["a", "b", "c"]);
    expect(sorted(rows, "desc")).toEqual(["c", "b", "a"]);
    const ties = [{ name: "First" }, { name: "Second" }, { name: "Third" }];
    expect(sorted(ties, "desc")).toEqual(["First", "Second", "Third"]);
  });
});
