import { collection, doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";

import { db } from "../firebase";
import i18n from "@/config/i18n/internationalization";
import logger from "@/config/logging/logger";
import { createServiceError } from "@/config/logging/serviceError.utils";

export async function setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  try {
    await setDoc(doc(db, "chats", chatId, "typing", userId), {
      isTyping,
      updatedAt: serverTimestamp(),
    });
  } catch (cause) {
    throw createServiceError("typingStatus", "setTypingStatus", i18n.t("services:typingStatus.setTypingStatus"), cause);
  }
}

export function subscribeToTypingUsers(chatId: string, callback: (userIds: string[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, "chats", chatId, "typing"),
    (snapshot) => {
      const typingUserIds = snapshot.docs.filter((docSnapshot) => docSnapshot.data().isTyping === true).map((docSnapshot) => docSnapshot.id);

      callback(typingUserIds);
    },
    (error) => {
      logger.serviceError({ service: "typingStatus", operation: "subscribeToTypingUsers", error });
    },
  );
}
