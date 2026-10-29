export interface AgentReply {
  response: string;
  specialistsUsed: string[];
  workflowSteps: string[];
  messengerConversationId: string | null;
}

export interface AgentChatPayload {
  response?: unknown;
  specialists_used?: unknown;
  workflow_steps?: unknown;
  messenger_conversation_id?: unknown;
}

export interface AssistantTurn {
  response: string;
  messengerConversationId: string;
}
