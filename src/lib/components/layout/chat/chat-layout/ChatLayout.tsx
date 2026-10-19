import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import type { ConversationKind } from "../message/MessageBubble";
import Message from "@/lib/components/layout/chat/message/Message";

interface ChatLayoutProps {
  owner: User;
  messages: MessageInterface[];
  assistantId?: string;
  presentation?: "bubbles" | "timeline";
  conversationKind?: ConversationKind;
}

/**
 * ChatLayout
 *
 * Lista de mensagens compartilhada pelo chat entre usuários (`Chat`) e pelo
 * chatbot (`ChatbotPage`). Sem estilo definitivo ainda — estrutura genérica.
 */
export default function ChatLayout({ owner, messages, assistantId, presentation = "bubbles", conversationKind = "direct" }: ChatLayoutProps) {
  return (
    <section className={`flex min-w-0 flex-col ${presentation === "timeline" ? "gap-1" : "gap-6"}`}>
      {messages.map((message, index) => (
        <Message
          key={index}
          conversationKind={conversationKind}
          presentation={presentation}
          grouped={
            index > 0 &&
            messages[index - 1].user.id === message.user.id &&
            message.time.toDateString() === messages[index - 1].time.toDateString() &&
            message.time.getTime() >= messages[index - 1].time.getTime() &&
            message.time.getTime() - messages[index - 1].time.getTime() < 5 * 60 * 1000
          }
          message={message}
          owner={owner}
          placeholderAvatar={message.user.id === assistantId}
        />
      ))}
    </section>
  );
}
