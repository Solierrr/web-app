import i18n from "@/config/i18n/internationalization";
import { classifyHttpFailure, type HttpFailureKind } from "@/lib/shared/http/httpFailure.utils";

export class AgentChatError extends Error {
  constructor(
    public readonly kind: HttpFailureKind,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AgentChatError";
  }

  static fromFailure(error: unknown): AgentChatError {
    if (error instanceof AgentChatError) return error;
    const kind = classifyHttpFailure(error);
    return new AgentChatError(kind, i18n.t(`chat:agent.errors.${kind}`), { cause: error });
  }

  static unexpectedReply(): AgentChatError {
    return new AgentChatError("unknown", i18n.t("chat:agent.errors.unknown"));
  }
}
