import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewGroupDialog from "./NewGroupDialog";

const contacts = [
  { authId: "ana-id", username: "Ana", avatar: null },
  { authId: "bruno-id", username: "Bruno", avatar: null },
];

function renderDialog(extra: Partial<Parameters<typeof NewGroupDialog>[0]> = {}) {
  const onCreate = vi.fn();
  render(
    <NewGroupDialog contacts={contacts} loading={false} error={false} creating={false} onCreate={onCreate} onClose={() => undefined} {...extra} />,
  );
  return onCreate;
}

describe("NewGroupDialog", () => {
  it("only enables creation with a title and at least one other person", () => {
    renderDialog();
    const create = screen.getByRole("button", { name: "Criar grupo" });
    expect(create).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Nome do grupo"), { target: { value: "Equipe de obra" } });
    expect(create).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Ana"));
    expect(create).toBeEnabled();
  });

  it("creates the group with the trimmed title and the people picked", () => {
    const onCreate = renderDialog();
    fireEvent.change(screen.getByLabelText("Nome do grupo"), { target: { value: "  Equipe de obra " } });
    fireEvent.click(screen.getByLabelText("Ana"));
    fireEvent.click(screen.getByLabelText("Bruno"));
    fireEvent.click(screen.getByLabelText("Ana"));
    fireEvent.click(screen.getByRole("button", { name: "Criar grupo" }));
    expect(onCreate).toHaveBeenCalledWith("Equipe de obra", ["bruno-id"]);
  });

  it("says when there are no connections to invite", () => {
    renderDialog({ contacts: [] });
    expect(screen.getByText("Você ainda não tem conexões para convidar.")).toBeInTheDocument();
  });
});
