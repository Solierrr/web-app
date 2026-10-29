import { waitForMockService } from "@/config/mocks/mockMode.utils";
import { createMockChatbotConversation, getMockMessenger, sendMockMessage } from "@/features/messages/messages.messenger.d.mocks";
import { findAssistantConversation } from "@/features/messages/messages.assistant.utils";
import type { AgentReply, AssistantTurn } from "./assistant";

const MOCK_ASSISTANT_REPLY = "Posso ajudar com isso. Me conte um pouco mais sobre o seu caso.";

export async function mockAssistantTurn(threadId: string, message: string): Promise<AssistantTurn> {
  await waitForMockService();
  const known = findAssistantConversation(threadId);
  const existing = getMockMessenger().conversations.find(
    (item) => item.conversationType === "CHAT_BOT" && (item.id === known || item.id === threadId),
  );
  const conversation = existing ?? createMockChatbotConversation();
  sendMockMessage(conversation.id, message);
  return { response: MOCK_ASSISTANT_REPLY, messengerConversationId: conversation.id };
}

const MOCK_SCREENS: { words: string[]; text: string }[] = [
  { words: ["funcionario", "equipe", "cargo"], text: "A equipe da empresa fica em `/pt-BR/admin/funcionarios`." },
  { words: ["unidade", "filial"], text: "As unidades da empresa ficam em `/pt-BR/admin/unidades`." },
  { words: ["projeto"], text: "Os projetos ficam em `/pt-BR/projetos`." },
  { words: ["modelo"], text: "O catálogo de modelos de placa fica em `/pt-BR/admin/modelos-de-placa-solar`." },
  { words: ["configuracao", "senha", "seguranca"], text: "A segurança da conta fica em `/pt-BR/configuracoes/seguranca`." },
  { words: ["mensagem", "conversa"], text: "Suas conversas ficam em `/pt-BR/mensagens`." },
];

const MOCK_PROPOSAL = [
  "Posso cadastrar esta oferta, mas só depois do seu aceite:",
  "",
  "- Empresa: Solar XPTO",
  "- Placa: SolTech ST-450 450 Wp",
  "- Preço unitário: R$ 1.250,00",
  "- Disponibilidade: 20 unidades",
  "",
  'Você aceita? Responda "sim" para cadastrar, "não" para cancelar, ou me diga o que quer ajustar.',
].join("\n");

let pendingMockProposal = false;

function normalized(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function reply(text: string, agent: string): AgentReply {
  return { response: text, specialistsUsed: [agent], workflowSteps: [agent], messengerConversationId: null };
}

export async function mockOperationalReply(message: string): Promise<AgentReply> {
  await waitForMockService();
  const text = normalized(message);
  if (pendingMockProposal && ["sim", "aceito", "confirmo"].includes(text)) {
    pendingMockProposal = false;
    return reply('Pronto, a oferta "Placa solar SolTech ST-450" foi cadastrada por R$ 1.250,00 com 20 unidades.', "proposal_decision");
  }
  if (pendingMockProposal && ["nao", "cancelar", "recuso"].includes(text)) {
    pendingMockProposal = false;
    return reply("Tudo bem, não cadastrei nada.", "proposal_decision");
  }
  if (/(cadastr|cri|nov)\w*.*(oferta|placa)/.test(text)) {
    pendingMockProposal = true;
    return reply(MOCK_PROPOSAL, "action_proposer");
  }
  const screen = MOCK_SCREENS.find((item) => item.words.some((word) => text.includes(word)));
  if (screen) return reply(screen.text, "screen_finder");
  return reply("Posso indicar a tela certa ou cadastrar uma oferta de placa. O que você quer fazer?", "screen_finder");
}
