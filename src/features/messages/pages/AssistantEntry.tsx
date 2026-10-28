import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import ConversationIntro from "@@/layout/chat/conversation-intro/ConversationIntro";
import GroupAction from "@@/ui/button/GroupAction";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import Surface from "@@/ui/surface/Surface";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { startAssistantConversation } from "@/features/messages/messages.assistant.service";

/** Porta de entrada do assistente: a primeira mensagem abre uma conversa e leva para a tela de conversas, onde ela continua. */
export default function AssistantEntry() {
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const context = useActiveContext();
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [failed, setFailed] = useState(false);

  async function send() {
    const text = draft.trim();
    if (!text || creating) return;
    setCreating(true);
    setFailed(false);
    try {
      const { conversation, sendFailed } = await startAssistantConversation(
        context.kind === "company" ? (context.company?.type ?? "COMPANY") : "PERSONAL",
        text,
      );
      navigate(routePaths.chat(lang, conversation.id), sendFailed ? { state: { initialDraft: text, initialSendError: true } } : undefined);
    } catch {
      setFailed(true);
      setCreating(false);
    }
  }

  return (
    <main aria-label={t("chatbot.assistantName")} className="relative isolate flex h-full min-h-0 w-full flex-col">
      <SideCanvas centerWidth="var(--spacing-operational-copy)" />
      <SurfaceGroup direction="horizontal" divided={false} className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <GroupAction layout="icon" icon="history" label={t("chatbot.history")} to={routePaths.inbox(lang)} />
      </SurfaceGroup>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-operational-copy flex-col items-center justify-center gap-6 p-4 py-8 text-center sm:p-6">
        <ConversationIntro as="h1" title={t("chatbot.welcomeTitle")} subtitle={t("chatbot.welcomeSubtitle")} />
        {failed && (
          <p role="alert" className="text-body text-operational-muted">
            {t("createError")}
          </p>
        )}
        <Surface field className="w-full text-left" contentClassName="overflow-visible!">
          <div className="px-2 py-1">
            <MessageComposer
              assistant
              value={draft}
              onChange={setDraft}
              onSend={() => void send()}
              placeholder={t("chatbot.draftPlaceholder")}
              label={t("draftPlaceholder")}
              sendLabel={t("chatbot.sendDescription")}
              hint={t("chatbot.composerHint")}
              maxLength={8000}
              disabled={creating}
            />
          </div>
        </Surface>
      </div>
    </main>
  );
}
