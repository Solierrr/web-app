import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import Message from "@/lib/components/layout/chat/message/Message";

interface ChatLayoutProps {
  owner: User;
  messages: MessageInterface[];
  assistantId?: string;
}

/**
 * ChatLayout
 *
 * Lista de mensagens compartilhada pelo chat entre usuários (`Chat`) e pelo
 * chatbot (`ChatbotPage`). Sem estilo definitivo ainda — estrutura genérica.
 */
export default function ChatLayout({ owner, messages, assistantId }: ChatLayoutProps) {
  return (
    <section className="flex min-w-0 flex-col gap-6">
      {messages.map((message, index) => (
        <Message key={index} message={message} owner={owner} placeholderAvatar={message.user.id === assistantId} />
      ))}
    </section>
  );
}
