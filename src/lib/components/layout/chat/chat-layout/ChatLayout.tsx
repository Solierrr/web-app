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

function continues(previous: MessageInterface, current: MessageInterface) {
  return (
    previous.user.id === current.user.id &&
    current.time.toDateString() === previous.time.toDateString() &&
    current.time.getTime() >= previous.time.getTime() &&
    current.time.getTime() - previous.time.getTime() < 5 * 60 * 1000
  );
}

/**
 * ChatLayout
 *
 * Lista de mensagens compartilhada pelo chat entre usuários (`Chat`) e pelo
 * chatbot (`ChatbotPage`). Mensagens seguidas do mesmo autor formam uma sequência: ficam coladas e só a última
 * mostra a hora.
 */
export default function ChatLayout({ owner, messages, assistantId, presentation = "bubbles", conversationKind = "direct" }: ChatLayoutProps) {
  return (
    <section className={`flex min-w-0 flex-col ${presentation === "timeline" ? "gap-1" : "gap-0.5"}`}>
      {messages.map((message, index) => {
        const grouped = index > 0 && continues(messages[index - 1], message);
        const endOfGroup = !(index < messages.length - 1 && continues(message, messages[index + 1]));
        return (
          <div key={index} className={presentation === "bubbles" && !grouped && index > 0 ? "mt-4" : undefined}>
            <Message
              conversationKind={conversationKind}
              presentation={presentation}
              grouped={grouped}
              endOfGroup={endOfGroup}
              message={message}
              owner={owner}
              placeholderAvatar={message.user.id === assistantId}
            />
          </div>
        );
      })}
    </section>
  );
}
