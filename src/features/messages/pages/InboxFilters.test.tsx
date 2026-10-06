import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InboxFilters, { type ConversationFilter } from "./InboxFilters";

function Example() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("ALL");
  return (
    <>
      <InboxFilters query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />
      <output>
        {filter}:{query}
      </output>
    </>
  );
}

describe("InboxFilters", () => {
  it("opens existing menu options, applies a filter and preserves the search", () => {
    render(<Example />);
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar conversa" }), { target: { value: "Ana" } });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Filtrar conversas" });
    fireEvent.click(trigger);
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    fireEvent.click(screen.getByRole("menuitem", { name: "Pessoas" }));
    expect(screen.getByText("DIRECT:Ana")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Todas" }));
    expect(screen.getByText("ALL:Ana")).toBeInTheDocument();
  });

  it("closes the filter menu with Escape and restores trigger focus", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Filtrar conversas" });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
