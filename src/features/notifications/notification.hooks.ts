import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@@/feedback/toast/Toast.utils";
import logger from "@/config/logging/logger";
import { useMessengerConnection } from "@/features/messages/messages.hooks";
import type { NotificationItem } from "./notification";
import { PushStatus } from "./notification.enum";
import { disablePush, enablePush, getPushStatus, subscribeToForegroundPush, syncPushRegistration } from "./notification.push.service";
import { getUnreadCount, listNotifications, markAllNotificationsRead, markNotificationRead } from "./notification.service";
import {
  NOTIFICATIONS_CHANGED_EVENT,
  NOTIFICATION_RECEIVED_EVENT,
  PUSH_STATUS_EVENT,
  emitNotificationReceived,
  emitPushStatusChanged,
} from "./notification.utils";

export const NOTIFICATION_PAGE_SIZE = 20;

export function useUnreadCount(): { count: number; announced: number | null } {
  const [count, setCount] = useState(0);
  const [announced, setAnnounced] = useState<number | null>(null);
  const previous = useRef<number | null>(null);
  const latest = useRef(0);
  const connection = useMessengerConnection().status;

  const refresh = useCallback(() => {
    const request = ++latest.current;
    getUnreadCount()
      .then((next) => {
        if (request !== latest.current) return;
        if (previous.current !== null && next > previous.current) setAnnounced(next);
        previous.current = next;
        setCount(next);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
      window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  useEffect(() => {
    if (connection === "connected") refresh();
  }, [connection, refresh]);

  return { count, announced };
}

interface NotificationListState {
  items: NotificationItem[];
  page: number;
  totalPages: number;
  status: "loading" | "ready" | "error";
  loadingMore: boolean;
  failed: boolean;
}

const INITIAL_LIST: NotificationListState = { items: [], page: 0, totalPages: 0, status: "loading", loadingMore: false, failed: false };

export function useNotificationList() {
  const [state, setState] = useState(INITIAL_LIST);
  const latest = useRef(0);

  const reload = useCallback(() => {
    const request = ++latest.current;
    listNotifications({ page: 0, size: NOTIFICATION_PAGE_SIZE })
      .then((page) => {
        if (request === latest.current)
          setState({ ...INITIAL_LIST, items: page.content, page: page.page, totalPages: page.totalPages, status: "ready" });
      })
      .catch(() => {
        if (request === latest.current)
          setState((current) => ({ ...current, status: current.items.length ? "ready" : "error", failed: current.items.length > 0 }));
      });
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, reload);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, reload);
  }, [reload]);

  function retry() {
    setState((current) => ({ ...current, status: "loading", failed: false }));
    reload();
  }

  async function loadMore() {
    setState((current) => ({ ...current, loadingMore: true, failed: false }));
    try {
      const next = await listNotifications({ page: state.page + 1, size: NOTIFICATION_PAGE_SIZE });
      setState((current) => ({
        ...current,
        items: [...current.items, ...next.content.filter((item) => !current.items.some((known) => known.id === item.id))],
        page: next.page,
        totalPages: next.totalPages,
        loadingMore: false,
      }));
    } catch {
      setState((current) => ({ ...current, loadingMore: false, failed: true }));
    }
  }

  async function markRead(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setState((current) => ({
        ...current,
        failed: false,
        items: current.items.map((item) => (item.id === id ? { ...item, readAt: updated.readAt } : item)),
      }));
    } catch {
      setState((current) => ({ ...current, failed: true }));
    }
  }

  async function markAllRead(): Promise<boolean> {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setState((current) => ({ ...current, failed: false, items: current.items.map((item) => ({ ...item, readAt: item.readAt ?? now })) }));
      return true;
    } catch {
      setState((current) => ({ ...current, failed: true }));
      return false;
    }
  }

  return { ...state, hasMore: state.page + 1 < state.totalPages, retry, loadMore, markRead, markAllRead };
}

export function usePushStatus() {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const read = () => {
      getPushStatus()
        .then((next) => {
          if (active) setStatus(next);
        })
        .catch(() => undefined);
    };
    read();
    window.addEventListener(PUSH_STATUS_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(PUSH_STATUS_EVENT, read);
    };
  }, []);

  async function change(action: () => Promise<PushStatus>) {
    setBusy(true);
    setFailed(false);
    try {
      setStatus(await action());
      emitPushStatusChanged();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return { status, busy, failed, enable: () => change(enablePush), disable: () => change(disablePush) };
}

export function usePushRegistration(): void {
  useEffect(() => {
    void syncPushRegistration();
  }, []);
}

export function useForegroundPush(): void {
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const restart = () => setGeneration((current) => current + 1);
    window.addEventListener(PUSH_STATUS_EVENT, restart);
    return () => window.removeEventListener(PUSH_STATUS_EVENT, restart);
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    subscribeToForegroundPush((data) => {
      if (data.title) notify(data.body ? `${data.title}: ${data.body}` : data.title);
      emitNotificationReceived();
    })
      .then((stop) => {
        if (active) unsubscribe = stop;
        else stop();
      })
      .catch((error) => logger.serviceError({ service: "push", operation: "subscribeToForegroundPush", error }));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [generation]);
}
