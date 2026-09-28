import { collection, doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";

import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

import { db } from "../firebase";

type TypingCallback = (userIds: string[]) => void;

const mockTypingByChat = new Map<string, Map<string, boolean>>();
const mockTypingSubscribers = new Map<string, Set<TypingCallback>>();

function getMockTypingUsers(chatId: string): string[] {
  return Array.from(mockTypingByChat.get(chatId) ?? [])
    .filter(([, isTyping]) => isTyping)
    .map(([userId]) => userId);
}

function notifyMockTypingSubscribers(chatId: string): void {
  const typingUserIds = getMockTypingUsers(chatId);
  mockTypingSubscribers.get(chatId)?.forEach((callback) => callback(typingUserIds));
}

export async function setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const chatTypingStatus = mockTypingByChat.get(chatId) ?? new Map<string, boolean>();
    chatTypingStatus.set(userId, isTyping);
    mockTypingByChat.set(chatId, chatTypingStatus);
    notifyMockTypingSubscribers(chatId);
    return;
  }

  return setDoc(doc(db, "chats", chatId, "typing", userId), {
    isTyping,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTypingUsers(chatId: string, callback: (userIds: string[]) => void): Unsubscribe {
  if (isAlwaysMockMode()) {
    const chatSubscribers = mockTypingSubscribers.get(chatId) ?? new Set<TypingCallback>();
    chatSubscribers.add(callback);
    mockTypingSubscribers.set(chatId, chatSubscribers);

    let active = true;
    void waitForMockService().then(() => {
      if (active) callback(getMockTypingUsers(chatId));
    });

    return () => {
      active = false;
      chatSubscribers.delete(callback);
      if (chatSubscribers.size === 0) mockTypingSubscribers.delete(chatId);
    };
  }

  return onSnapshot(collection(db, "chats", chatId, "typing"), (snapshot) => {
    const typingUserIds = snapshot.docs.filter((docSnapshot) => docSnapshot.data().isTyping === true).map((docSnapshot) => docSnapshot.id);

    callback(typingUserIds);
  });
}
