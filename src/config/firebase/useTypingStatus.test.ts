import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, act } from "@testing-library/react";

const { setTypingStatusMock, subscribeToTypingUsersMock, unsubscribeMock } = vi.hoisted(() => ({
  setTypingStatusMock: vi.fn(),
  subscribeToTypingUsersMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}));

vi.mock("./typingStatus.service", () => ({
  setTypingStatus: setTypingStatusMock,
  subscribeToTypingUsers: subscribeToTypingUsersMock,
}));

import { useTypingStatus } from "./useTypingStatus";

describe("useTypingStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    subscribeToTypingUsersMock.mockReturnValue(unsubscribeMock);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    setTypingStatusMock.mockReset();
    subscribeToTypingUsersMock.mockReset();
    unsubscribeMock.mockReset();
  });

  it("marks the user as typing and resets to idle after 3s of inactivity", () => {
    const { result } = renderHook(() => useTypingStatus("chat-1", "user-1"));

    act(() => result.current.notifyTyping());
    expect(setTypingStatusMock).toHaveBeenCalledWith("chat-1", "user-1", true);

    act(() => vi.advanceTimersByTime(3000));
    expect(setTypingStatusMock).toHaveBeenCalledWith("chat-1", "user-1", false);
  });

  it("does not reset to idle while notifyTyping keeps being called before the debounce elapses", () => {
    const { result } = renderHook(() => useTypingStatus("chat-1", "user-1"));

    act(() => result.current.notifyTyping());
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.notifyTyping());
    act(() => vi.advanceTimersByTime(2000));

    expect(setTypingStatusMock).not.toHaveBeenCalledWith("chat-1", "user-1", false);

    act(() => vi.advanceTimersByTime(1000));
    expect(setTypingStatusMock).toHaveBeenCalledWith("chat-1", "user-1", false);
  });

  it("stopTyping immediately marks idle and cancels the pending debounce", () => {
    const { result } = renderHook(() => useTypingStatus("chat-1", "user-1"));

    act(() => result.current.notifyTyping());
    act(() => result.current.stopTyping());

    expect(setTypingStatusMock).toHaveBeenLastCalledWith("chat-1", "user-1", false);
    const callsToFalseBeforeAdvance = setTypingStatusMock.mock.calls.filter(
      (call) => call[2] === false,
    ).length;

    act(() => vi.advanceTimersByTime(3000));

    const callsToFalseAfterAdvance = setTypingStatusMock.mock.calls.filter(
      (call) => call[2] === false,
    ).length;
    expect(callsToFalseAfterAdvance).toBe(callsToFalseBeforeAdvance);
  });

  it("excludes the current user's own id from typingUserIds", () => {
    const { result } = renderHook(() => useTypingStatus("chat-1", "user-1"));

    const emitTypingUsers = subscribeToTypingUsersMock.mock.calls[0][1];
    act(() => emitTypingUsers(["user-1", "user-2"]));

    expect(result.current.typingUserIds).toEqual(["user-2"]);
  });

  it("unsubscribes and marks idle on unmount", () => {
    const { unmount } = renderHook(() => useTypingStatus("chat-1", "user-1"));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
    expect(setTypingStatusMock).toHaveBeenCalledWith("chat-1", "user-1", false);
  });
});
