import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import Message from "@/components/layout/chat/message/Message";

interface ChatLayoutProps {
  owner: User;
  messages: MessageInterface[];
}

/**
 * ChatLayout
 *
 * Lista de mensagens compartilhada pelo chat entre usuários (`Chat`) e pelo
 * chatbot (`ChatbotPage`). Sem estilo definitivo ainda — estrutura genérica.
 */
export default function ChatLayout({ owner, messages }: ChatLayoutProps) {
  return (
    <section className="flex flex-col gap-2">
      {messages.map((message, index) => (
        <Message key={index} message={message} owner={owner} />
      ))}
    </section>
  );
}
