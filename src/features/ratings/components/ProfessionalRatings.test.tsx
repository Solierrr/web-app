import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfessionalRatings from "./ProfessionalRatings";
import { createRating, excludeRating, listRatingsOf, type Rating } from "../ratings.service";

vi.mock("../ratings.service", async (original) => ({
  ...(await original<typeof import("../ratings.service")>()),
  listRatingsOf: vi.fn(),
  createRating: vi.fn(),
  updateRating: vi.fn(),
  excludeRating: vi.fn(),
}));
vi.mock("@/features/messages/messages.messenger.api", () => ({ getUserSummary: vi.fn(async () => ({ username: "Ana", avatar: null })) }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@@/feedback/toast/Toast.utils", () => ({ notify: vi.fn() }));

const rating = (evaluatorId: string, value: number): Rating => ({
  id: `${evaluatorId}-${value}`,
  evaluatorId,
  evaluatedId: "pro",
  typeRate: "PROFISSIONAL",
  comment: "Bom serviço",
  rating: value,
  status: "ACTIVE",
  timestamp: "x",
});

describe("ProfessionalRatings", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shows the average and who rated", async () => {
    vi.mocked(listRatingsOf).mockResolvedValue([rating("ana", 5), rating("bia", 4)]);
    render(<ProfessionalRatings evaluatedId="pro" />);
    expect(await screen.findByText("Nota 4.5 de 5 · 2 avaliações")).toBeInTheDocument();
    expect(await screen.findAllByText(/Ana · 5 estrelas/)).toHaveLength(1);
  });

  it("rates the professional", async () => {
    vi.mocked(listRatingsOf).mockResolvedValue([]);
    vi.mocked(createRating).mockResolvedValue(rating("me", 3));
    render(<ProfessionalRatings evaluatedId="pro" />);
    fireEvent.click(await screen.findByRole("button", { name: "Avaliar" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar avaliação" }));
    expect(await screen.findByText(/Você · 3 estrelas/)).toBeInTheDocument();
    expect(createRating).toHaveBeenCalledWith({ evaluatedId: "pro", typeRate: "PROFISSIONAL", rating: 3, comment: undefined });
  });

  it("deletes the own rating", async () => {
    vi.mocked(listRatingsOf).mockResolvedValue([rating("me", 2)]);
    vi.mocked(excludeRating).mockResolvedValue({ ...rating("me", 2), status: "EXCLUDED" });
    render(<ProfessionalRatings evaluatedId="pro" />);
    fireEvent.click(await screen.findByRole("button", { name: "Excluir minha avaliação" }));
    expect(await screen.findByText("Ainda sem avaliações.")).toBeInTheDocument();
  });

  it("does not let the professional rate themself", async () => {
    vi.mocked(listRatingsOf).mockResolvedValue([]);
    render(<ProfessionalRatings evaluatedId="me" />);
    expect(await screen.findByText("Ainda sem avaliações.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Avaliar" })).not.toBeInTheDocument();
  });
});
