import { describe, expect, it } from "vitest";
import { groupByProjectDay, historyCategory } from "./projects.presentation.utils";
describe("project chronological grouping", () => {
  const events = [
    { id: "late", at: new Date(2026, 9, 13, 16).toISOString() },
    { id: "earlier-day", at: new Date(2026, 9, 12, 23).toISOString() },
    { id: "early", at: new Date(2026, 9, 13, 8).toISOString() },
  ];
  it("groups by local calendar day and orders appointments without mutating their source", () => {
    const groups = groupByProjectDay(events, (e) => e.at);
    expect(groups.map((g) => g.items.map((e) => e.id))).toEqual([["earlier-day"], ["early", "late"]]);
    expect(events[0].id).toBe("late");
  });
  it("orders history with most recent events first", () => {
    expect(groupByProjectDay(events, (e) => e.at, true).map((g) => g.items.map((e) => e.id))).toEqual([["late", "early"], ["earlier-day"]]);
  });
  it("returns no sections for an empty agenda", () => {
    expect(groupByProjectDay([], () => "")).toEqual([]);
  });
});
describe("history categories", () => {
  it.each([
    ["INVITE_ACCEPTED", "people"],
    ["INVITE_RESENT", "people"],
    ["MEMBER_REMOVED", "people"],
    ["COVER_CHANGED", "photos"],
    ["PHOTO_ADDED", "photos"],
    ["ACTIVITY_STATUS", "activity"],
    ["STATUS", "status"],
    ["FUTURE_EVENT", "updated"],
  ])("classifies %s as %s", (action, key) => {
    expect(historyCategory(action).key).toBe(key);
  });
});
