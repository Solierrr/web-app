import { useEffect, useRef, useState } from "react";

import { setTypingStatus, subscribeToTypingUsers } from "./typingStatus.service";

const IDLE_TIMEOUT_MS = 3000;

interface UseTypingStatusResult {
  notifyTyping: () => void;
  stopTyping: () => void;
  typingUserIds: string[];
}

/**
 * useTypingStatus
 *
 * Hook reutilizável para o indicador de "digitando..." via Firestore.
 * Não fica preso a nenhum componente de input: chame `notifyTyping()`
 * manualmente no `onChange` de qualquer input de qualquer página de chat.
 */
export function useTypingStatus(chatId: string, userId: string): UseTypingStatusResult {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToTypingUsers(chatId, (userIds) => {
      setTypingUserIds(userIds.filter((id) => id !== userId));
    });

    return () => {
      unsubscribe();
      clearTimeout(idleTimeoutRef.current);
      setTypingStatus(chatId, userId, false);
    };
  }, [chatId, userId]);

  function notifyTyping() {
    clearTimeout(idleTimeoutRef.current);
    setTypingStatus(chatId, userId, true);
    idleTimeoutRef.current = setTimeout(() => {
      setTypingStatus(chatId, userId, false);
    }, IDLE_TIMEOUT_MS);
  }

  function stopTyping() {
    clearTimeout(idleTimeoutRef.current);
    setTypingStatus(chatId, userId, false);
  }

  return { notifyTyping, stopTyping, typingUserIds };
}
