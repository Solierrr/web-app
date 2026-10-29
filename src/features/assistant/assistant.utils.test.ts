import { describe, expect, it } from "vitest";
import SupportedLanguages from "@/config/i18n/supported.enum";
import { routePaths } from "@/config/i18n/paths";
import { OPERATIONAL_SCREENS, extractScreenLinks, hasPendingProposal } from "./assistant.utils";

describe("extractScreenLinks", () => {
  it("links a cited screen to the same route in the interface language", () => {
    expect(extractScreenLinks("As ofertas ficam em `/pt-BR/admin/ofertas`.", SupportedLanguages.PTBR)).toEqual([
      { screen: "offersManagement", to: routePaths.offersManagement(SupportedLanguages.PTBR) },
    ]);
    expect(extractScreenLinks("As ofertas ficam em `/pt-BR/admin/ofertas`.", SupportedLanguages.ENUS)).toEqual([
      { screen: "offersManagement", to: "/en-US/admin/offers" },
    ]);
  });

  it("understands paths written in any supported language and several screens at once", () => {
    const links = extractScreenLinks("Veja /es-ES/admin/empleados e depois /en-US/settings/security.", SupportedLanguages.PTBR);

    expect(links.map((link) => link.screen)).toEqual(["employeesManagement", "settingsSecurity"]);
    expect(links.map((link) => link.to)).toEqual(["/pt-BR/admin/funcionarios", "/pt-BR/configuracoes/seguranca"]);
  });

  it("maps the chatbot segment the agent registry uses to the segment of the web app", () => {
    expect(extractScreenLinks("Abra `/pt-BR/painel/chatbot`.", SupportedLanguages.PTBR).map((link) => link.screen)).toEqual(["operationalChatbot"]);
    expect(extractScreenLinks("Abra `/en-US/chatbot`.", SupportedLanguages.ENUS).map((link) => link.screen)).toEqual(["chatbot"]);
  });

  it("does not repeat a screen and ignores trailing punctuation", () => {
    expect(extractScreenLinks("Em /pt-BR/mensagens. Também em (/pt-BR/mensagens), ok?", SupportedLanguages.PTBR)).toHaveLength(1);
  });

  it.each([
    "Abra https://evil.example/pt-BR/admin/ofertas agora",
    "Abra //evil.example/pt-BR/admin/ofertas",
    "Abra /pt-BR/projetos/id-qualquer",
    "Abra /pt-BR/rota-que-nao-existe",
    "Abra /fr-FR/admin/ofertas",
    "Abra javascript:alert(1)",
    "Abra /pt-BR/admin/../../etc/passwd",
    "sem caminho algum",
  ])("offers no button for %s", (text) => {
    expect(extractScreenLinks(text, SupportedLanguages.PTBR)).toEqual([]);
  });

  it("only exposes routes that the web app really declares", () => {
    for (const screen of OPERATIONAL_SCREENS) expect(routePaths[screen](SupportedLanguages.PTBR)).toMatch(/^\/pt-BR/);
  });
});

describe("hasPendingProposal", () => {
  const proposal = 'Posso cadastrar esta oferta.\n\nVocê aceita? Responda "sim" para cadastrar, "não" para cancelar.';

  it("waits for confirmation only after the action agents ask for it", () => {
    expect(hasPendingProposal({ response: proposal, specialistsUsed: ["action_proposer"] })).toBe(true);
    expect(
      hasPendingProposal({ response: 'A proposta continua pendente. Responda "sim" para cadastrar.', specialistsUsed: ["proposal_decision"] }),
    ).toBe(true);
  });

  it("does not ask for confirmation on questions, results or screen answers", () => {
    expect(hasPendingProposal({ response: "Para cadastrar a oferta ainda preciso saber:\n- o preço", specialistsUsed: ["action_proposer"] })).toBe(
      false,
    );
    expect(hasPendingProposal({ response: "Pronto, a oferta foi cadastrada.", specialistsUsed: ["proposal_decision"] })).toBe(false);
    expect(hasPendingProposal({ response: proposal, specialistsUsed: ["screen_finder"] })).toBe(false);
  });
});
