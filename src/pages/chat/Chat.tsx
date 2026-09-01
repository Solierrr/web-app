import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import Message from "@/components/layout/message/Message";
import Textarea from "@@/ui/textarea/Textarea";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getMessages, sendMessage } from "@/features/messages/messages.service";
import { useTypingStatus } from "@/config/firebase/useTypingStatus";
import userMock from "@/features/users/user/user.d.mock";


interface ChatLayoutProps {
  owner: User;
  messages: MessageInterface[];
}


export function ChatLayout({ owner, messages }: ChatLayoutProps) {
  return (
    <section className="flex flex-col gap-2">
      {messages.map((message, index) => (
        <Message key={index} message={message} owner={owner} />
      ))}
    </section>
  );
}


export default function Chat() {
  const { contactId = "" } = useParams<{ contactId: string }>();
  const { t } = useTranslation("chat");
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [draft, setDraft] = useState("");
  const { notifyTyping, stopTyping, typingUserIds } = useTypingStatus(contactId, userMock[0].id);

  useEffect(() => {
    let active = true;

    getMessages(contactId).then((result) => {
      if (active) setMessages(result);
    });

    return () => {
      active = false;
    };
  }, [contactId]);

  function handleDraftChange(value: string) {
    setDraft(value);
    if (value.trim()) {
      notifyTyping();
    } else {
      stopTyping();
    }
  }

  async function handleSend() {
    if (!draft.trim()) return;

    const message: MessageInterface = { user: userMock[0], message: draft, time: new Date() };
    const sent = await sendMessage(contactId, message);
    setMessages((current) => [...current, sent]);
    setDraft("");
    stopTyping();
  }

  return (
    <section className="flex flex-col gap-4">
      <ChatLayout owner={userMock[0]} messages={messages} />

      {typingUserIds.length > 0 && <p className="text-sm text-gray-500">{t("typing")}</p>}

      <div className="flex flex-row gap-2">
        <Textarea
          name="draft"
          placeholder={t("draftPlaceholder")}
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          onBlur={stopTyping}
          className="w-full"
        />
        <PrimaryButton content={t("send")} description={t("sendDescription")} action={handleSend} />
      </div>
    </section>
  );
}
