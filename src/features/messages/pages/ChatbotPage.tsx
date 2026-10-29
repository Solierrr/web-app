import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ChatHeader from "@@/layout/chat/chat-header/ChatHeader";
import WrapperLayout from "@/config/WrapperLayout";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Icon from "@@/ui/icon/Icon";
import MorphingHexagon from "@@/ui/morphing-hexagon/MorphingHexagon";
import OrganicLogo from "@@/brand/logo/OrganicLogo";
import Surface from "@@/ui/surface/Surface";
import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { createChatbotConversation } from "@/features/messages/messages.messenger.api";
import { Conversation } from "./Chat";

type Failure = "signIn" | "create" | null;

export default function ChatbotPage({
  operational = false,
  embedded = false,
  active = true,
  userType = "PERSONAL",
}: {
  operational?: boolean;
  embedded?: boolean;
  active?: boolean;
  userType?: string;
}) {
  const { t } = useTranslation("chat", { keyPrefix: "chatbot" });
  const { t: tChat } = useTranslation("chat");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const panelStyle = embedded || operational;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [firstMessage, setFirstMessage] = useState<string | undefined>();
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const composer = useRef<HTMLDivElement>(null);

  function startNewConversation() {
    setConversationId(null);
    setFirstMessage(undefined);
    setDraft("");
    setFailure(null);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || starting) return;
    if (!getAuthSession()) {
      setFailure("signIn");
      return;
    }
    setStarting(true);
    setFailure(null);
    try {
      const conversation = await createChatbotConversation(userType);
      setFirstMessage(text);
      setConversationId(conversation.id);
      setDraft("");
    } catch {
      setFailure("create");
    } finally {
      setStarting(false);
    }
  }

  const composerContent = (
    <div ref={composer} className={`shrink-0 ${operational ? "px-2 py-1" : ""}`}>
      {failure === "create" && (
        <p role="alert" className="mb-2 text-body text-operational-muted">
          {tChat("createError")}
        </p>
      )}
      {failure === "signIn" && (
        <p role="alert" className="mb-2 text-body text-operational-muted">
          {t("signInRequired")}{" "}
          <Link to={routePaths.login(lang)} className="font-medium text-operational-ink underline">
            {t("signIn")}
          </Link>
        </p>
      )}
      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={() => void handleSend()}
        placeholder={t("draftPlaceholder")}
        label={tChat("draftPlaceholder")}
        sendLabel={t("sendDescription")}
        hint={t("composerHint")}
        maxLength={8000}
        compact={panelStyle}
        assistant={operational}
        active={active}
        disabled={starting}
      />
    </div>
  );

  const helpBanner = embedded && (
    <div className="flex shrink-0 items-center justify-between gap-2 rounded-hard bg-operational-surface px-3 py-2">
      <span className="text-body">{t("needHelp")}</span>
      <ToolbarAction
        to={routePaths.solarPanelsFeed(lang)}
        content={t("explore")}
        label={t("explore")}
        className="h-7!"
        backgroundColor="var(--color-white)"
      />
    </div>
  );

  const content = conversationId ? (
    <section className={`flex min-h-0 min-w-0 flex-col gap-2 ${panelStyle ? "h-full flex-1" : "h-[min(44rem,80dvh)]"}`}>
      {helpBanner}
      <Conversation
        key={conversationId}
        conversationId={conversationId}
        embedded
        initialMessage={firstMessage}
        actions={
          <ToolbarAction
            icon="newConversation"
            label={t("newConversation")}
            content={t("newConversation")}
            hideContentOnMobile
            className="text-operational-muted"
            onClick={startNewConversation}
          />
        }
      />
    </section>
  ) : operational ? (
    <section className="flex min-h-full w-full flex-col items-center justify-center gap-6 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <OrganicLogo width={6} decorative paused={!active} motion="expressive" rotateSymbol rotateShape holdMs={1571} transitionMs={1000} />
        <h1 className="text-operational-title font-semi-bold leading-8">{t("welcomeTitle")}</h1>
      </div>
      <Surface field className="w-full" contentClassName="overflow-visible!">
        {composerContent}
      </Surface>
    </section>
  ) : (
    <section className={`flex min-h-0 min-w-0 flex-col ${panelStyle ? "gap-2" : "gap-4"} ${panelStyle ? "h-full flex-1" : "h-[min(44rem,80dvh)]"}`}>
      {!panelStyle && (
        <ChatHeader title={t("assistantName")} assistant>
          <ToolbarAction
            icon="newConversation"
            label={t("newConversation")}
            content={t("newConversation")}
            hideContentOnMobile
            disabled={!draft}
            className="text-operational-muted"
            onClick={startNewConversation}
          />
        </ChatHeader>
      )}
      {helpBanner}
      <div className="scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto pb-2">
        <div className={`flex min-h-full flex-col justify-center px-1 ${panelStyle ? "mx-auto max-w-72 gap-3 py-2" : "gap-6 py-4"}`}>
          <div className={`flex flex-col ${panelStyle ? "items-center gap-2 text-center" : "items-start gap-3"}`}>
            <MorphingHexagon paused={!active} icon="sparkles" className={`${panelStyle ? "mb-2 size-24" : "mb-1 size-16"} shrink-0`} />
            <h2 className={`${panelStyle ? "text-body font-medium" : "text-label font-semi-bold"} leading-relaxed`}>{t("welcomeTitle")}</h2>
            <p className="text-body leading-relaxed text-operational-muted">{t(panelStyle ? "panelDescription" : "welcomeDescription")}</p>
          </div>
          <div className="flex w-full flex-col gap-2">
            {(["catalog", "compare", "help"] as const).map((key) =>
              panelStyle ? (
                <button
                  key={key}
                  type="button"
                  className="flex items-center gap-3 rounded-hard bg-input-bg px-3 py-2 text-left transition-colors hover:bg-operational-hover focus-visible:outline-orange"
                  onClick={() => {
                    setDraft(t(`suggestions.${key}`));
                    composer.current?.querySelector("textarea")?.focus();
                  }}>
                  <Icon
                    name={key === "catalog" ? "layoutGrid" : key === "compare" ? "panels" : "sparkles"}
                    size={16}
                    className="shrink-0"
                    color="var(--color-input-icon)"
                  />
                  <span className="flex min-w-0 flex-col text-body">
                    <span className="text-body font-medium leading-5">{t(`suggestionTitles.${key}`)}</span>
                    <span className="text-body leading-5 text-operational-muted">{t(`suggestionDescriptions.${key}`)}</span>
                  </span>
                </button>
              ) : (
                <ToolbarAction
                  key={key}
                  icon={key === "catalog" ? "layoutGrid" : key === "compare" ? "panels" : "sparkles"}
                  label={t(`suggestions.${key}`)}
                  content={t(`suggestions.${key}`)}
                  backgroundColor="var(--color-input-bg)"
                  className="h-auto! min-h-12 justify-start! py-3 text-left [&_span]:whitespace-normal [&_span]:leading-relaxed"
                  onClick={() => {
                    setDraft(t(`suggestions.${key}`));
                    composer.current?.querySelector("textarea")?.focus();
                  }}
                />
              ),
            )}
          </div>
        </div>
      </div>
      {composerContent}
    </section>
  );

  if (embedded) return content;
  return operational ? (
    <main aria-label={t("assistantName")} className="relative isolate flex h-full min-h-0 w-full flex-col">
      {!conversationId && <SideCanvas centerWidth="var(--spacing-operational-copy)" />}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-operational-copy flex-col p-4 sm:p-6">{content}</div>
    </main>
  ) : (
    <WrapperLayout ptop>{content}</WrapperLayout>
  );
}
