import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuditEvent } from "../../types/admin";
import AuditChanges from "./AuditChanges";

// What AuditLive.Index.diff/1 showed, now this component's job.
const event = (changes: AuditEvent["changes"], credentialBodies?: Record<string, string>): AuditEvent => ({
  id: "audit-1",
  event: "updated",
  itemType: "credential",
  itemId: "11111111-2222-3333-4444-555555555555",
  actorId: "66666666-7777-8888-9999-000000000000",
  actorLabel: "Amy Admin",
  actorIdentifier: "amy@example.com",
  insertedAt: "2026-10-14T18:36:12Z",
  changes,
  ...(credentialBodies && { credentialBodies }),
});

function renderChanges(audit: AuditEvent) {
  render(
    // eslint-disable-next-line no-restricted-syntax -- the component is a <td>, which needs a bare table around it here
    <table>
      <tbody>
        <tr>
          <AuditChanges audit={audit} />
        </tr>
      </tbody>
    </table>
  );
  return screen.queryAllByRole("listitem").map((li) => ({
    text: li.textContent?.replace(/\s+/g, " ").trim(),
    struck: li.querySelector(".line-through")?.textContent ?? null,
    arrow: li.querySelector(".hero-arrow-right") !== null,
  }));
}

describe("AuditChanges", () => {
  it("lists every field in name order with old struck through, an arrow, then new", () => {
    const items = renderChanges(
      event({ before: { foo: "foo_before", bar: "bar_before" }, after: { foo: "foo_after", bar: "bar_after" } })
    );
    expect(items).toEqual([
      { text: "bar bar_before bar_after", struck: "bar_before", arrow: true },
      { text: "foo foo_before foo_after", struck: "foo_before", arrow: true },
    ]);
  });

  it("shows only the new value, with no arrow, when there is no before", () => {
    for (const before of [null, {}]) {
      const items = renderChanges(event({ before, after: { foo: "foo_after", bar: "bar_after" } }));
      expect(items).toEqual([
        { text: "bar bar_after", struck: null, arrow: false },
        { text: "foo foo_after", struck: null, arrow: false },
      ]);
      document.body.innerHTML = "";
    }
  });

  it("shows the old value struck through, an arrow and nothing, when there is no after", () => {
    for (const after of [null, {}]) {
      const items = renderChanges(event({ before: { foo: "foo_before", bar: "bar_before" }, after }));
      expect(items).toEqual([
        { text: "bar bar_before", struck: "bar_before", arrow: true },
        { text: "foo foo_before", struck: "foo_before", arrow: true },
      ]);
      document.body.innerHTML = "";
    }
  });

  it("includes keys only on one side, in order", () => {
    const items = renderChanges(
      event({ before: { foo: "f1", bar: "b1", gone: "g1" }, after: { foo: "f2", bar: "b2", baz: "z2" } })
    );
    expect(items.map((i) => i.text)).toEqual(["bar b1 b2", "baz z2", "foo f1 f2", "gone g1"]);
    expect(items.map((i) => i.arrow)).toEqual([true, false, true, true]);
  });

  it("prints numbers and booleans as text", () => {
    const items = renderChanges(event({ before: { period: 30, enabled: true }, after: { period: 7, enabled: false } }));
    expect(items.map((i) => i.text)).toEqual(["enabled true false", "period 30 7"]);
  });

  it("says No changes when both sides are nil or empty", () => {
    for (const changes of [
      { before: null, after: null },
      { before: {}, after: {} },
    ]) {
      renderChanges(event(changes));
      expect(screen.getByRole("cell").textContent?.trim()).toBe("No changes");
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
      document.body.innerHTML = "";
    }
  });

  it("lists credential bodies by environment, without the body: prefix twice", () => {
    renderChanges(event({ before: null, after: null }, { "body:staging": "abc==", "body:production": "xyz==" }));
    const items = within(screen.getByRole("cell")).getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "body:production xyz==",
      "body:staging abc==",
    ]);
  });
});
