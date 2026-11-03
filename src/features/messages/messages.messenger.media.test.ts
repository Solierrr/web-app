import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConversationDto } from "./messages.messenger.api";
import {
  MEDIA_LIMITS,
  MediaTooLargeError,
  MediaUnavailableError,
  attachmentTypeOf,
  downloadAttachment,
  sendFileAttachment,
  sendLocationAttachment,
} from "./messages.messenger.media";

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "test-token" }) }));

const group: ConversationDto = { id: "conv-1", conversationType: "GROUP", participantIds: ["me", "ana"], title: "Obra", lastInteractionAt: null };
const fetchMock = vi.fn();
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(
    new Response(body === null ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}
const headersOf = (call: number) => (fetchMock.mock.calls[call][1] as RequestInit).headers as Record<string, string>;
const bodyOf = (call: number) => JSON.parse((fetchMock.mock.calls[call][1] as RequestInit).body as string);

describe("Messenger media", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("classifies the file by its mime type", () => {
    expect(attachmentTypeOf(new File([""], "a.png", { type: "image/png" }))).toBe("IMAGE");
    expect(attachmentTypeOf(new File([""], "a.m4a", { type: "audio/mp4" }))).toBe("AUDIO");
    expect(attachmentTypeOf(new File([""], "a.mp4", { type: "video/mp4" }))).toBe("VIDEO");
    expect(attachmentTypeOf(new File([""], "a.pdf", { type: "application/pdf" }))).toBe("FILE");
  });

  it("asks for the upload, sends the bytes to the signed url without the account token and posts the message", async () => {
    const file = new File(["%PDF"], "laudo.pdf", { type: "application/pdf" });
    respond({
      mediaId: "m1",
      upload: { url: "https://bucket.example/m1", method: "PUT", headers: { "Content-Type": "application/pdf" } },
      uploadExpiresAt: "x",
      maxBytes: 100,
    });
    respond(null);
    respond({
      id: "msg",
      conversationId: "conv-1",
      senderId: "me",
      content: "",
      timestamp: "x",
      sequence: 3,
      attachment: { type: "FILE", mediaId: "m1" },
    });

    const sent = await sendFileAttachment(group, file, "", "client-1");

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/messaging\/media$/);
    expect(bodyOf(0)).toEqual({ conversationId: "conv-1", type: "FILE", mimeType: "application/pdf", sizeBytes: 4 });
    expect(fetchMock.mock.calls[1][0]).toBe("https://bucket.example/m1");
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe("PUT");
    expect(headersOf(1)).toEqual({ "Content-Type": "application/pdf" });
    expect(bodyOf(2)).toMatchObject({
      conversationId: "conv-1",
      clientMessageId: "client-1",
      messageType: "USER_TO_GROUP",
      attachment: { type: "FILE", mediaId: "m1", mimeType: "application/pdf", sizeBytes: 4, name: "laudo.pdf" },
    });
    expect(sent.attachment?.mediaId).toBe("m1");
  });

  it("refuses a file above the limit of its type before calling the server", async () => {
    const big = new File([new Uint8Array(MEDIA_LIMITS.IMAGE + 1)], "big.png", { type: "image/png" });
    await expect(sendFileAttachment(group, big, "", "c")).rejects.toBeInstanceOf(MediaTooLargeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not post the message when the bucket refuses the upload", async () => {
    respond({ mediaId: "m1", upload: { url: "https://bucket.example/m1", method: "PUT", headers: {} }, uploadExpiresAt: "x", maxBytes: 100 });
    respond(null, 403);
    await expect(sendFileAttachment(group, new File(["x"], "a.txt", { type: "text/plain" }), "", "c")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sends the location inside the message", async () => {
    respond({ id: "msg", conversationId: "conv-1", senderId: "me", content: "", timestamp: "x", sequence: 4 });
    await sendLocationAttachment(group, { latitude: -23.5, longitude: -46.6 }, "c");
    expect(bodyOf(0).attachment).toEqual({ type: "LOCATION", latitude: -23.5, longitude: -46.6 });
  });

  it("downloads with the account token from the messenger and reports expired media as unavailable", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bytes", { status: 200 }));
    const blob = await downloadAttachment({ type: "IMAGE", mediaId: "m1" });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/messaging\/media\/m1\/content$/);
    expect(headersOf(0)).toEqual({ Authorization: "Bearer test-token" });
    expect(blob.size).toBe(5);

    respond({ errorCode: "MEDIA_EXPIRED" }, 410);
    await expect(downloadAttachment({ type: "IMAGE", mediaId: "m1" })).rejects.toBeInstanceOf(MediaUnavailableError);
    await expect(downloadAttachment({ type: "FILE", mediaId: "m2", expiresAt: "2020-01-01T00:00:00Z" })).rejects.toBeInstanceOf(
      MediaUnavailableError,
    );
  });
});
