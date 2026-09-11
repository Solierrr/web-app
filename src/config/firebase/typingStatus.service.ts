import { collection, doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from "firebase/firestore";

import { db } from "./firebase";

export function setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  return setDoc(doc(db, "chats", chatId, "typing", userId), {
    isTyping,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTypingUsers(chatId: string, callback: (userIds: string[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "chats", chatId, "typing"), (snapshot) => {
    const typingUserIds = snapshot.docs.filter((docSnapshot) => docSnapshot.data().isTyping === true).map((docSnapshot) => docSnapshot.id);

    callback(typingUserIds);
  });
}
