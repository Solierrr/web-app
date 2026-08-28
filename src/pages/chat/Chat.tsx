import { useParams } from "react-router-dom";

import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import Message from "@/components/layout/message/Message";

interface ChatLayoutProps {
    owner: User;
    messages: MessageInterface[];
}

export function ChatLayout({ owner, messages }: ChatLayoutProps) {
    return (
        <section>
            { messages.map((message, index) => (
                <Message key={index} message={message} owner={owner} />
            ))}
        </section>
    );
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();

  return <section>{id}</section>;
}
