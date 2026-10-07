import { Fragment, useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import Icon from "@@/ui/icon/Icon";
import Instructions from "@@/ui/instructions/Instructions";
import type { SaaSNavigationGroup } from "@/features/saas/saas";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import { filterPages } from "@/features/dashboard/dashboard.utils";
import { useRecentPages } from "@/features/dashboard/dashboard.hooks";

interface PageSearchProps {
  groups: SaaSNavigationGroup[];
  lang: SupportedLanguage;
  context: string;
  collapsed: boolean;
  onNavigate: () => void;
  showTrigger?: boolean;
}

export default function PageSearch({ groups, lang, context, collapsed, onNavigate, showTrigger = true }: PageSearchProps) {
  const { t } = useTranslation("saas");
  const navigate = useNavigate();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [position, setPosition] = useState({ left: 16, top: 80, width: 640, height: 420 });
  const recentKeys = useRecentPages(context);
  const all = groups.flatMap((group) => group.items.filter((item) => item.key !== "dashboard").map((item) => ({ ...item, group: group.label })));
  const recent = recentKeys.flatMap((key) => all.filter((item) => item.key === key));
  const results = query.trim()
    ? filterPages(groups, query, lang, t).flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
    : [...recent, ...all.filter((item) => !recentKeys.includes(item.key))];
  const active = Math.min(selected, Math.max(0, results.length - 1));

  function place() {
    const rect = trigger.current?.getBoundingClientRect();
    const width = Math.min(640, window.innerWidth - 32);
    const top = Math.min(rect?.bottom && rect.bottom > 0 ? rect.bottom + 8 : 80, window.innerHeight - 180);
    setPosition({
      left: Math.max(16, Math.min(rect?.left ?? 16, window.innerWidth - width - 16)),
      top: Math.max(16, top),
      width,
      height: Math.max(140, Math.min(440, window.innerHeight - top - 16)),
    });
  }

  function show() {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    place();
    setQuery("");
    setSelected(0);
    setOpen(true);
  }

  function close(restore = false) {
    setOpen(false);
    if (restore) restoreFocus();
  }

  function restoreFocus() {
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      if (target && target !== document.body && target.isConnected && !target.closest("[inert]")) target.focus();
      else document.getElementById("operational-content")?.focus();
    });
  }

  const openFromShortcut = useEffectEvent(() => {
    if (open) close(true);
    else show();
  });
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openFromShortcut();
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector("input")?.focus();
    function outside(event: PointerEvent) {
      if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      restoreFocus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (open) panel.current?.querySelector('[role="option"][aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open, query]);

  function select(index: number) {
    const item = results[index];
    if (!item) return;
    navigate(item.to(lang));
    onNavigate();
    close(true);
  }

  return (
    <>
      {showTrigger && (
        <button
          ref={trigger}
          type="button"
          aria-label={t("home.search")}
          title={t("home.search")}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? `${id}-results` : undefined}
          onClick={() => (open ? close(true) : show())}
          className={`flex min-h-10 w-full cursor-pointer items-center rounded-medium bg-input-bg px-3 py-2 hover:bg-operational-hover ${collapsed ? "justify-center" : "gap-3"}`}>
          <Icon name="search" size={20} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-body font-medium">{t("home.search")}</span>
              <Instructions items={["Ctrl", "K"]} />
            </>
          )}
        </button>
      )}
      {open &&
        createPortal(
          <div
            ref={panel}
            className="fixed z-50 flex flex-col gap-2 rounded-hard bg-white p-2 shadow-lg"
            style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.height }}>
            <div className="flex shrink-0 items-center gap-2 rounded-medium bg-input-bg px-3">
              <Icon name="search" size={20} color="var(--color-operational-muted)" />
              <Input
                name={t("home.search")}
                placeholder={t("home.search")}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(0);
                }}
                role="combobox"
                aria-expanded={open}
                aria-controls={`${id}-results`}
                aria-autocomplete="list"
                aria-activedescendant={results.length ? `${id}-result-${active}` : undefined}
                className="w-full! bg-transparent! [&_input]:px-0 [&_input]:text-body"
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    if (results.length) setSelected((active + (event.key === "ArrowDown" ? 1 : results.length - 1)) % results.length);
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    select(active);
                  }
                }}
              />
              <Instructions items={["Ctrl", "K"]} className="shrink-0" />
            </div>
            <ul id={`${id}-results`} role="listbox" aria-label={t("home.shortcuts")} className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
              {results.map((item, index) => (
                <Fragment key={item.key}>
                  {!query.trim() && (index === 0 || index === recent.length) && (
                    <li role="presentation" className="px-3 pb-1 pt-2 text-body text-operational-muted">
                      {t(index === 0 && recent.length ? "home.recent" : "home.shortcuts")}
                    </li>
                  )}
                  <li
                    id={`${id}-result-${index}`}
                    role="option"
                    aria-selected={active === index}
                    onPointerMove={() => setSelected(index)}
                    onClick={() => select(index)}
                    className={`flex cursor-pointer items-center gap-3 rounded-medium px-3 py-3 ${active === index ? "bg-operational-hover" : ""}`}>
                    <Icon name={!query.trim() && recentKeys.includes(item.key) ? "history" : item.icon} size={18} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-body">
                      {t(item.label)} <span className="text-body text-operational-muted">— {t(item.group)}</span>
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
            {results.length === 0 && (
              <p role="status" className="p-3 text-body text-operational-muted">
                {t("home.noResults")}
              </p>
            )}
            <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-medium bg-operational-surface p-2">
              <Instructions items={["↑", "↓"]} />
              <span className="text-body text-operational-muted">{t("home.navigate")}</span>
              <Instructions items={["Enter"]} />
              <span className="text-body text-operational-muted">{t("home.select")}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
