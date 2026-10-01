import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Message as MessageInterface } from "@/features/messages/messages";
import ChatLayout from "@/lib/components/layout/chat/chat-layout/ChatLayout";
import Textarea from "@@/ui/textarea/Textarea";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import userMock from "@/features/users/user/user.d.mock";
import WrapperLayout from "@/config/WrapperLayout";
import OperationalPage from "@@/layout/operational-page/OperationalPage";

export default function ChatbotPage({ operational = false }: { operational?: boolean }) {
  const { t } = useTranslation("chat", { keyPrefix: "chatbot" });
  const { t: tChat } = useTranslation("chat");
  const botUser = { ...userMock[1], name: t("assistantName") };

  const [messages, setMessages] = useState<MessageInterface[]>([{ user: botUser, message: t("greeting"), time: new Date() }]);
  const [draft, setDraft] = useState("");

  function handleSend() {
    if (!draft.trim()) return;

    setMessages((current) => [...current, { user: userMock[0], message: draft, time: new Date() }]);
    setDraft("");
  }

  const content = (
    <section className="flex flex-col gap-4">
      <ChatLayout owner={userMock[0]} messages={messages} />

      <div className="flex flex-row gap-2">
        <Textarea
          name="draft"
          placeholder={t("draftPlaceholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full"
        />
        <PrimaryButton content={tChat("send")} description={t("sendDescription")} onClick={handleSend} />
      </div>
    </section>
  );
  return operational ? (
    <OperationalPage title={t("assistantName")} chat>
      {content}
    </OperationalPage>
  ) : (
    <WrapperLayout ptop>{content}</WrapperLayout>
  );
}
