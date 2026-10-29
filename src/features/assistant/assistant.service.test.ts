import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/config/i18n/internationalization";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { HttpResponseError, httpJson } from "@/lib/shared/http/http.service";
import { refresh } from "@/features/access/access.service";
import { sendAssistantTurn, sendOperationalTurn } from "./assistant.service";

vi.mock("@/lib/shared/http/http.service", async (importOriginal) => ({ ...(await importOriginal<object>()), httpJson: vi.fn() }));
vi.mock("@/features/access/access.service", () => ({ refresh: vi.fn() }));

const failure = (status: number) => new Error(`HTTP ${status}`, { cause: new HttpResponseError(status, "HTTP_ERROR") });
const payload = { response: "Olá!", specialists_used: ["faq_reader"], workflow_steps: ["router", "faq_reader"], messenger_conversation_id: "conv-9" };

describe("agent chat service", () => {
  beforeEach(() => {
    vi.mocked(httpJson).mockReset();
    vi.mocked(refresh).mockReset();
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await i18n.changeLanguage("pt-BR");
  });

  it("calls the assistant with the thread, the access token and a two minute limit", async () => {
    vi.mocked(httpJson).mockResolvedValue(payload);

    await expect(sendAssistantTurn("thread-1", "Preciso de placas")).resolves.toEqual({ response: "Olá!", messengerConversationId: "conv-9" });

    const [url, options] = vi.mocked(httpJson).mock.calls[0];
    expect(url).toMatch(/\/chat$/);
    expect(options).toMatchObject({ method: "POST", body: { conversation_id: "thread-1", message: "Preciso de placas" }, timeoutMs: 120_000 });
    expect(options.authenticated).not.toBe(false);
  });

  it("returns the operational reply without a messenger conversation", async () => {
    vi.mocked(httpJson).mockResolvedValue({
      response: "Fica em `/pt-BR/admin/ofertas`.",
      specialists_used: ["screen_finder"],
      workflow_steps: ["screen_finder"],
    });

    await expect(sendOperationalTurn("thread-2", "Onde ficam as ofertas?")).resolves.toEqual({
      response: "Fica em `/pt-BR/admin/ofertas`.",
      specialistsUsed: ["screen_finder"],
      workflowSteps: ["screen_finder"],
      messengerConversationId: null,
    });
  });

  it("rejects an assistant answer that carries no messenger conversation", async () => {
    vi.mocked(httpJson).mockResolvedValue({ response: "Olá!" });

    await expect(sendAssistantTurn("thread-1", "oi")).rejects.toMatchObject({ kind: "unknown" });
  });

  it("rejects a malformed answer", async () => {
    vi.mocked(httpJson).mockResolvedValue({ detail: "ok" });

    await expect(sendOperationalTurn("thread-1", "oi")).rejects.toBeInstanceOf(AgentChatError);
  });

  it("renews the session once after a 401 and repeats the turn", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(failure(401)).mockResolvedValueOnce(payload);
    vi.mocked(refresh).mockResolvedValue({} as never);

    await expect(sendAssistantTurn("thread-1", "oi")).resolves.toMatchObject({ messengerConversationId: "conv-9" });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([
    [401, "unauthorized", "Sua sessão expirou"],
    [403, "forbidden", "não tem permissão"],
    [429, "rateLimited", "Muitas mensagens"],
    [503, "unavailable", "indisponível ou iniciando"],
    [500, "unavailable", "indisponível ou iniciando"],
  ])("explains HTTP %i as %s", async (status, kind, text) => {
    vi.mocked(httpJson).mockRejectedValue(failure(status));
    vi.mocked(refresh).mockResolvedValue(null);

    await expect(sendOperationalTurn("thread-1", "oi")).rejects.toMatchObject({ kind, message: expect.stringContaining(text) });
  });

  it("explains a timeout and a lost connection", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(new Error("slow", { cause: new DOMException("slow", "TimeoutError") }));
    await expect(sendAssistantTurn("t", "oi")).rejects.toMatchObject({ kind: "timeout" });

    vi.mocked(httpJson).mockRejectedValueOnce(new Error("offline", { cause: new TypeError("Failed to fetch") }));
    await expect(sendAssistantTurn("t", "oi")).rejects.toMatchObject({ kind: "network" });
  });

  it("localizes the failure message", async () => {
    await i18n.changeLanguage("en-US");
    vi.mocked(httpJson).mockRejectedValue(failure(429));

    await expect(sendAssistantTurn("t", "oi")).rejects.toThrow("Too many messages in a short time");
  });

  it("answers locally in mock mode without calling the services", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_AI_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");

    const reply = await sendOperationalTurn("t", "Onde ficam os funcionários?");

    expect(reply.response).toContain("/pt-BR/admin/funcionarios");
    expect(reply.specialistsUsed).toEqual(["screen_finder"]);
    expect(httpJson).not.toHaveBeenCalled();
  });
});
