import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { sendOperationalTurn } from "../assistant.service";
import { resetOperationalConversation } from "../assistant.operational.store";
import OperationalAssistant from "./OperationalAssistant";

vi.mock("../assistant.service", () => ({ sendOperationalTurn: vi.fn() }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));
vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => null }));

const reply = (response: string, specialistsUsed: string[]) => ({
  response,
  specialistsUsed,
  workflowSteps: specialistsUsed,
  messengerConversationId: null,
});
const proposal =
  'Posso cadastrar esta oferta, mas só depois do seu aceite:\n\n- Preço unitário: R$ 1.250,00\n\nVocê aceita? Responda "sim" para cadastrar, "não" para cancelar.';

function renderAssistant(state?: unknown, embedded = false) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/pt-BR/painel/assistente", state }]}>
      <Routes>
        <Route path="/:lang/painel/assistente" element={<OperationalAssistant embedded={embedded} />} />
        <Route path="*" element={<p>outra tela</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function ask(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem ao assistente" }));
}

describe("OperationalAssistant", () => {
  beforeEach(() => {
    vi.mocked(sendOperationalTurn).mockReset();
    sessionStorage.clear();
    resetOperationalConversation();
  });

  it("answers a question and offers a button only to the known screen the answer cites", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValue(
      reply("As ofertas ficam em `/pt-BR/admin/ofertas`. Não use `/pt-BR/rota-inventada` nem https://evil.example/pt-BR/admin/unidades.", [
        "screen_finder",
      ]),
    );
    renderAssistant();
    expect(screen.getByText("Como posso ajudar na sua operação?")).toBeInTheDocument();

    ask("Onde ficam as ofertas?");

    const link = await screen.findByRole("link", { name: "Abrir as ofertas" });
    expect(link).toHaveAttribute("href", "/pt-BR/admin/ofertas");
    expect(screen.queryByRole("link", { name: "Abrir as unidades" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link").filter((item) => item.textContent?.startsWith("Abrir"))).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Confirmar ação" })).not.toBeInTheDocument();
    fireEvent.click(link);
    expect(await screen.findByText("outra tela")).toBeInTheDocument();
  });

  it("shows what is pending and waits for the explicit confirmation before executing anything", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply(proposal, ["action_proposer"]));
    renderAssistant();
    ask("Cadastre uma oferta da ST-450");

    const confirm = await screen.findByRole("button", { name: "Confirmar ação" });
    expect(screen.getByText("Nada foi executado ainda. A ação só acontece depois da sua confirmação.")).toBeInTheDocument();
    expect(sendOperationalTurn).toHaveBeenCalledTimes(1);

    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply('Pronto, a oferta "ST-450" foi cadastrada.', ["proposal_decision"]));
    fireEvent.click(confirm);

    expect(await screen.findByText(/foi cadastrada/)).toBeInTheDocument();
    expect(vi.mocked(sendOperationalTurn).mock.calls[1][1]).toBe("sim");
    expect(screen.getByText("Confirmo a ação proposta")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar ação" })).not.toBeInTheDocument();
  });

  it("cancels the proposal with its own message", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply(proposal, ["action_proposer"]));
    renderAssistant();
    ask("Cadastre uma oferta");
    const decline = await screen.findByRole("button", { name: "Cancelar ação" });

    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply("Tudo bem, não cadastrei nada.", ["proposal_decision"]));
    fireEvent.click(decline);

    expect(await screen.findByText("Tudo bem, não cadastrei nada.")).toBeInTheDocument();
    expect(vi.mocked(sendOperationalTurn).mock.calls[1][1]).toBe("não");
  });

  it("explains a failure, keeps the message and resends it on demand", async () => {
    vi.mocked(sendOperationalTurn)
      .mockRejectedValueOnce(
        new AgentChatError("unavailable", "O assistente está indisponível ou iniciando, o que pode levar até 1 minuto. Tente novamente."),
      )
      .mockResolvedValueOnce(reply("Fica em `/pt-BR/mensagens`.", ["screen_finder"]));
    renderAssistant();
    ask("Onde ficam as mensagens?");

    expect(await screen.findByText(/indisponível ou iniciando/)).toBeInTheDocument();
    expect(screen.getByText("Onde ficam as mensagens?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reenviar" }));

    expect(await screen.findByRole("link", { name: "Abrir as mensagens" })).toBeInTheDocument();
    expect(sendOperationalTurn).toHaveBeenCalledTimes(2);
  });

  it("shows that the assistant is working while the answer is on its way", async () => {
    let finish!: (value: ReturnType<typeof reply>) => void;
    vi.mocked(sendOperationalTurn).mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderAssistant();
    ask("Olá");

    expect(await screen.findByText(/O assistente está consultando as telas/)).toBeInTheDocument();
    finish(reply("Oi!", ["screen_finder"]));
    await waitFor(() => expect(screen.queryByText(/O assistente está consultando as telas/)).not.toBeInTheDocument());
    expect(screen.getByText("Oi!")).toBeInTheDocument();
  });

  it("sends the question that came from the inbox once and clears the navigation state", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValue(reply("Fica em `/pt-BR/admin/unidades`.", ["screen_finder"]));
    renderAssistant({ initialMessage: "Onde ficam as unidades?" }, true);

    expect(await screen.findByRole("link", { name: "Abrir as unidades" })).toBeInTheDocument();
    expect(sendOperationalTurn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendOperationalTurn).mock.calls[0][1]).toBe("Onde ficam as unidades?");
  });
});
