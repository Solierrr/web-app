import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { User } from "@/features/users/user/user";
import type { Message as MessageInterface } from "@/features/messages/messages";
import Message from "@/components/layout/message/Message";

interface ChatLayoutProps {
    owner: User;
    messages: MessageInterface[];
}

function ChatLayout({ owner, messages }: ChatLayoutProps) {
    return (
        <section>
            { messages.map((message) => (
                <Message message={message} owner={owner} />
            ))}
        </section>
    );
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();

  return
}
