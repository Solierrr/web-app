import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectLanguage, isSupportedLanguage } from "@/config/i18n/browser/languages";
import type { PushNavigationTarget } from "../notification";
import { markNotificationRead } from "../notification.service";
import { PUSH_LAUNCH_PARAMETER, normalizePushTarget, parsePushLaunch, resolveNotificationRoute, stripPushLaunch } from "../notification.utils";

const MESSAGE_SOURCE = "solaria-push";

export default function PushNavigation() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const first = pathname.split("/")[1];
  const lang = isSupportedLanguage(first) ? first : detectLanguage();

  useEffect(() => {
    if (!new URLSearchParams(search).has(PUSH_LAUNCH_PARAMETER)) return;
    const target = parsePushLaunch(search);
    const route = target ? resolveNotificationRoute(target, lang) : null;
    if (target?.notificationId) void markNotificationRead(target.notificationId).catch(() => undefined);
    navigate(route ?? { pathname, search: stripPushLaunch(search) }, { replace: true });
  }, [search, pathname, lang, navigate]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const open = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.source !== MESSAGE_SOURCE) return;
      const target: PushNavigationTarget | null = normalizePushTarget(event.data.target);
      if (!target) return;
      if (target.notificationId) void markNotificationRead(target.notificationId).catch(() => undefined);
      const route = resolveNotificationRoute(target, lang);
      if (route) navigate(route);
    };
    const container = navigator.serviceWorker;
    container.addEventListener("message", open);
    container.startMessages?.();
    return () => container.removeEventListener("message", open);
  }, [lang, navigate]);

  return null;
}
