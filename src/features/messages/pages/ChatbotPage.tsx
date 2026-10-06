import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Message as MessageInterface, MessageAttachment } from "@/features/messages/messages";
import ChatLayout from "@/lib/components/layout/chat/chat-layout/ChatLayout";
import userMock from "@/features/users/user/user.d.mock";
import WrapperLayout from "@/config/WrapperLayout";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Icon from "@@/ui/icon/Icon";
import MorphingHexagon from "@@/ui/morphing-hexagon/MorphingHexagon";
import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import { useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

export default function ChatbotPage({
  operational = false,
  embedded = false,
  active = true,
}: {
  operational?: boolean;
  embedded?: boolean;
  active?: boolean;
}) {
  const { t } = useTranslation("chat", { keyPrefix: "chatbot" });
  const { t: tChat } = useTranslation("chat");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const panelStyle = embedded || operational;
  const botUser = { ...userMock[1], name: t("assistantName") };
  const [messages, setMessages] = useState<MessageInterface[]>([{ user: botUser, message: t("greeting"), time: new Date() }]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState(false);
  const attachmentUrls = useRef(new Set<string>());
  const conversation = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function addFiles(files: File[]) {
    const accepted = files.filter(
      (file) =>
        file.size <= 20 * 1024 * 1024 && (/^image\/(png|jpeg|webp|gif)$/.test(file.type) || /\.(pdf|txt|csv|docx?|xlsx?|pptx?)$/i.test(file.name)),
    );
    const selected = accepted.slice(0, Math.max(0, 5 - attachments.length));
    setAttachmentError(selected.length !== files.length);
    const added = selected.map((file) => {
      const url = URL.createObjectURL(file);
      attachmentUrls.current.add(url);
      return { id: crypto.randomUUID(), name: file.name, type: file.type, url };
    });
    setAttachments((current) => [...current, ...added]);
  }

  function removeAttachment(id: string) {
    const attachment = attachments.find((item) => item.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
      attachmentUrls.current.delete(attachment.url);
    }
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  useEffect(() => {
    if (conversation.current) conversation.current.scrollTop = messages.length === 1 ? 0 : conversation.current.scrollHeight;
  }, [messages.length]);

  function handleSend() {
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    setMessages((current) => [...current, { user: userMock[0], message: text, time: new Date(), attachments }]);
    setDraft("");
    setAttachments([]);
    setAttachmentError(false);
    composer.current?.querySelector("textarea")?.focus();
  }

  const content = (
    <section className={`flex min-h-0 min-w-0 flex-col ${panelStyle ? "gap-2" : "gap-4"} ${panelStyle ? "h-full flex-1" : "h-[min(44rem,80dvh)]"}`}>
      {(!panelStyle || (operational && messages.length > 1)) && (
        <div className="flex shrink-0 justify-end">
          <ToolbarAction
            icon="newConversation"
            label={t("newConversation")}
            content={t("newConversation")}
            disabled={messages.length === 1 && !draft}
            className="text-operational-muted"
            onClick={() => {
              setMessages([{ user: botUser, message: t("greeting"), time: new Date() }]);
              setDraft("");
              attachmentUrls.current.forEach((url) => URL.revokeObjectURL(url));
              attachmentUrls.current.clear();
              setAttachments([]);
              setAttachmentError(false);
              composer.current?.querySelector("textarea")?.focus();
            }}
          />
        </div>
      )}
      {embedded && (
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
      )}
      <div
        ref={conversation}
        className="scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto pb-2"
        aria-live="polite"
        aria-relevant="additions text">
        {messages.length === 1 ? (
          <div className={`flex min-h-full flex-col justify-center px-1 ${panelStyle ? "mx-auto max-w-72 gap-3 py-2" : "gap-6 py-4"}`}>
            <div className={`flex flex-col ${panelStyle ? "items-center gap-2 text-center" : "items-start gap-3"}`}>
              <MorphingHexagon paused={!active} className={`${panelStyle ? "mb-2 size-20" : "mb-1 size-12"} shrink-0`} />
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
        ) : (
          <ChatLayout owner={userMock[0]} messages={messages} assistantId={botUser.id} />
        )}
      </div>
      <div ref={composer} className="shrink-0">
        {attachmentError && (
          <p role="alert" className="mb-2 text-body text-operational-muted">
            {tChat("attachments.rejected")}
          </p>
        )}
        <MessageComposer
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          placeholder={t("draftPlaceholder")}
          label={tChat("draftPlaceholder")}
          sendLabel={t("sendDescription")}
          hint={t("composerHint")}
          compact={panelStyle}
          active={active}
          attachments={attachments}
          onFilesSelected={panelStyle ? addFiles : undefined}
          onRemoveAttachment={removeAttachment}
        />
      </div>
    </section>
  );
  if (embedded) return content;
  return operational ? (
    <main aria-label={t("assistantName")} className="relative isolate flex h-full min-h-0 w-full flex-col">
      {messages.length === 1 && <SideCanvas centerWidth="var(--spacing-operational-copy)" />}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-operational-copy flex-col p-4 sm:p-6">{content}</div>
    </main>
  ) : (
    <WrapperLayout ptop>{content}</WrapperLayout>
  );
}
