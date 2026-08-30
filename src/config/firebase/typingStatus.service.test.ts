import { afterEach, describe, expect, it, vi } from "vitest";

const { docMock, setDocMock, collectionMock, onSnapshotMock, serverTimestampMock, dbMock } = vi.hoisted(() => ({
  docMock: vi.fn(() => "doc-ref"),
  setDocMock: vi.fn(),
  collectionMock: vi.fn(() => "collection-ref"),
  onSnapshotMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "server-timestamp"),
  dbMock: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: docMock,
  setDoc: setDocMock,
  collection: collectionMock,
  onSnapshot: onSnapshotMock,
  serverTimestamp: serverTimestampMock,
}));

vi.mock("./firebase", () => ({
  db: dbMock,
}));

import { setTypingStatus, subscribeToTypingUsers } from "./typingStatus.service";

describe("typingStatus.service", () => {
  afterEach(() => {
    docMock.mockClear();
    setDocMock.mockClear();
    collectionMock.mockClear();
    onSnapshotMock.mockClear();
    serverTimestampMock.mockClear();
  });

  describe("setTypingStatus", () => {
    it("writes the typing status to chats/{chatId}/typing/{userId}", async () => {
      await setTypingStatus("chat-1", "user-1", true);

      expect(docMock).toHaveBeenCalledWith(dbMock, "chats", "chat-1", "typing", "user-1");
      expect(setDocMock).toHaveBeenCalledWith("doc-ref", {
        isTyping: true,
        updatedAt: "server-timestamp",
      });
    });
  });

  describe("subscribeToTypingUsers", () => {
    it("calls back with the ids of users currently typing", () => {
      const callback = vi.fn();

      subscribeToTypingUsers("chat-1", callback);

      expect(collectionMock).toHaveBeenCalledWith(dbMock, "chats", "chat-1", "typing");

      const snapshotHandler = onSnapshotMock.mock.calls[0][1];
      snapshotHandler({
        docs: [
          { id: "user-1", data: () => ({ isTyping: true }) },
          { id: "user-2", data: () => ({ isTyping: false }) },
          { id: "user-3", data: () => ({ isTyping: true }) },
        ],
      });

      expect(callback).toHaveBeenCalledWith(["user-1", "user-3"]);
    });
  });
});
