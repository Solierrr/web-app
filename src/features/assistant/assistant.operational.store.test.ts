import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { sendOperationalTurn } from "./assistant.service";
import {
  answerOperationalProposal,
  getOperationalConversation,
  discardOperationalMessage,
  resetOperationalConversation,
  retryOperationalMessage,
  sendOperationalMessage,
} from "./assistant.operational.store";

vi.mock("./assistant.service", () => ({ sendOperationalTurn: vi.fn() }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId: "me" }) }));

const reply = (response: string, specialistsUsed: string[]) => ({
  response,
  specialistsUsed,
  workflowSteps: specialistsUsed,
  messengerConversationId: null,
});
const proposal = 'Posso cadastrar esta oferta.\n\nVocê aceita? Responda "sim" para cadastrar, "não" para cancelar.';

const read = getOperationalConversation;

async function settle() {
  await vi.waitFor(() => {
    expect(read().messages.some((message) => message.status === "sending" || message.status === "queued")).toBe(false);
  });
}

describe("operational conversation", () => {
  beforeEach(() => {
    vi.mocked(sendOperationalTurn).mockReset();
    sessionStorage.clear();
    resetOperationalConversation();
  });

  it("sends the question with the conversation thread and records the answer", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValue(reply("Fica em `/pt-BR/admin/ofertas`.", ["screen_finder"]));

    sendOperationalMessage("  Onde ficam as ofertas?  ");
    await settle();

    const state = read();
    expect(sendOperationalTurn).toHaveBeenCalledWith(state.threadId, "Onde ficam as ofertas?");
    expect(state.messages.map((message) => [message.role, message.content, message.status])).toEqual([
      ["user", "Onde ficam as ofertas?", undefined],
      ["assistant", "Fica em `/pt-BR/admin/ofertas`.", undefined],
    ]);
    expect(state.messages[1].proposal).toBe(false);
  });

  it("ignores blank messages", () => {
    sendOperationalMessage("   ");

    expect(sendOperationalTurn).not.toHaveBeenCalled();
    expect(read().messages).toEqual([]);
  });

  it("never runs a proposed action by itself: the confirmation is a separate message", async () => {
    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply(proposal, ["action_proposer"]));
    sendOperationalMessage("Cadastre uma oferta da ST-450 a R$ 1.250 com 20 unidades");
    await settle();

    expect(read().messages[1]).toMatchObject({ role: "assistant", proposal: true });
    expect(sendOperationalTurn).toHaveBeenCalledTimes(1);

    vi.mocked(sendOperationalTurn).mockResolvedValueOnce(reply("Pronto, a oferta foi cadastrada.", ["proposal_decision"]));
    answerOperationalProposal(true);
    await settle();

    expect(vi.mocked(sendOperationalTurn).mock.calls[1][1]).toBe("sim");
    const messages = read().messages;
    expect(messages[1].proposal).toBe(false);
    expect(messages[2]).toMatchObject({ role: "user", content: "sim", decision: "confirm" });
    expect(messages[3]).toMatchObject({ role: "assistant", proposal: false });
  });

  it("sends the refusal as its own message", async () => {
    vi.mocked(sendOperationalTurn)
      .mockResolvedValueOnce(reply(proposal, ["action_proposer"]))
      .mockResolvedValueOnce(reply("Tudo bem, não cadastrei nada.", ["proposal_decision"]));
    sendOperationalMessage("Cadastre uma oferta");
    await settle();

    answerOperationalProposal(false);
    await settle();

    expect(vi.mocked(sendOperationalTurn).mock.calls[1][1]).toBe("não");
    expect(read().messages[2]).toMatchObject({ content: "não", decision: "decline" });
  });

  it("keeps a failed message with the reason, lets the user retry it and keeps the order of the queue", async () => {
    vi.mocked(sendOperationalTurn)
      .mockRejectedValueOnce(new AgentChatError("timeout", "O assistente demorou demais para responder. Tente novamente."))
      .mockResolvedValueOnce(reply("Ok", ["screen_finder"]));
    sendOperationalMessage("Primeira");
    await settle();

    const failed = read().messages[0];
    expect(failed).toMatchObject({ status: "failed", reason: "O assistente demorou demais para responder. Tente novamente." });

    retryOperationalMessage(failed.id);
    await settle();

    expect(sendOperationalTurn).toHaveBeenCalledTimes(2);
    expect(read().messages.map((message) => message.status)).toEqual([undefined, undefined]);
  });

  it("processes messages typed while the agent is busy one after the other", async () => {
    const order: string[] = [];
    vi.mocked(sendOperationalTurn).mockImplementation(async (_thread, message) => {
      order.push(message);
      await new Promise((resolve) => setTimeout(resolve, 5));
      return reply(`resposta a ${message}`, ["screen_finder"]);
    });

    sendOperationalMessage("um");
    sendOperationalMessage("dois");
    await settle();

    expect(order).toEqual(["um", "dois"]);
    expect(read().messages.map((message) => message.content)).toEqual(["um", "dois", "resposta a um", "resposta a dois"]);
  });

  it("discards a failed message", async () => {
    vi.mocked(sendOperationalTurn).mockRejectedValue(new Error("boom"));
    sendOperationalMessage("Oi");
    await settle();

    discardOperationalMessage(read().messages[0].id);

    expect(read().messages).toEqual([]);
  });

  it("starts a new thread and drops an answer that arrives for the old one", async () => {
    let finish!: (value: ReturnType<typeof reply>) => void;
    vi.mocked(sendOperationalTurn).mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    sendOperationalMessage("Oi");
    const oldThread = read().threadId;

    resetOperationalConversation();
    finish(reply("tarde demais", ["screen_finder"]));
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(read().threadId).not.toBe(oldThread);
    expect(read().messages).toEqual([]);
  });
});
