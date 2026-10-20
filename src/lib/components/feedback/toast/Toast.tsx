import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { toastEventName, type ToastMessage } from "./Toast.utils";
import Surface from "@@/ui/surface/Surface";

interface QueuedToast extends ToastMessage {
  id: number;
  remaining: number;
}

export default function Toast() {
  const [notifications, setNotifications] = useState<QueuedToast[]>([]);
  const nextId = useRef(0);
  const { t } = useTranslation("commons");
  const front = notifications[0];

  useLayoutEffect(() => {
    const receive = (event: Event) => {
      const notification = (event as CustomEvent<ToastMessage>).detail;
      const item = { ...notification, id: ++nextId.current, remaining: notification.duration };
      setNotifications((current) => [item, ...current]);
    };
    window.addEventListener(toastEventName, receive);
    return () => window.removeEventListener(toastEventName, receive);
  }, []);

  useEffect(() => {
    if (!front) return;
    const started = Date.now();
    const timeout = window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== front.id));
    }, front.remaining);
    return () => {
      window.clearTimeout(timeout);
      front.remaining = Math.min(front.duration, Math.max(0, front.remaining - (Date.now() - started)));
    };
  }, [front]);

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-[100] flex justify-center">
      <div className="relative w-full max-w-lg">
        {notifications.slice(0, 3).map((notification, index) => (
          <div
            key={notification.id}
            aria-hidden={index > 0 ? true : undefined}
            className={`${index === 0 ? "relative" : "absolute inset-x-0 bottom-0"} transition-[transform,opacity] duration-250 motion-reduce:transition-none`}
            style={{ zIndex: 3 - index, transform: `translateY(-${index * 12}px) scale(${1 - index * 0.04})`, opacity: 1 - index * 0.15 }}>
            <Surface
              role="status"
              className="toast-enter pointer-events-auto"
              contentClassName="flex items-center gap-3 px-4 py-3 text-body text-operational-ink">
              <span className="min-w-0 flex-1 break-words">{notification.message}</span>
              <button
                type="button"
                aria-label={t("actions.close")}
                tabIndex={index === 0 ? 0 : -1}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink"
                onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}>
                <Icon name="x" size={16} />
              </button>
            </Surface>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
