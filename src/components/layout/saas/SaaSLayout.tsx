import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import MocksMode from "@/config/mocks/mocksMode.enum";
import { getMocksMode } from "@/config/mocks/mockMode.utils";
import { getAuthSession } from "@/shared/auth/authToken.utils";
import { getOperationalContext } from "@/features/saas/saas.service";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { saasNavigation } from "@/features/saas/saasNavigation.config";
import type { SaaSRole } from "@/features/saas/saas";
import { SaaSNavigation } from "./SaaSLayout.reusable";

interface SaaSLayoutProps {
  role: SaaSRole;
}

export default function SaaSLayout({ role }: SaaSLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [operationalAccess, setOperationalAccess] = useState(role === "admin" || getMocksMode() !== MocksMode.DEACTIVATED);
  const [accessLoading, setAccessLoading] = useState(role !== "admin" && getMocksMode() === MocksMode.DEACTIVATED);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpen = useRef(false);
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const sidebarCollapsed = collapsed && !mobileOpen;
  const { t } = useTranslation("saas");

  useEffect(() => {
    if (role === "admin" || getMocksMode() !== MocksMode.DEACTIVATED) {
      setOperationalAccess(true);
      setAccessLoading(false);
      return;
    }

    const session = getAuthSession();
    if (!session) {
      navigate(routePaths.login(lang), { replace: true });
      return;
    }

    let current = true;
    setAccessLoading(true);
    getOperationalContext()
      .then((context) => {
        if (!current) return;
        if (!context) {
          navigate(routePaths.ownUserProfile(lang), { replace: true });
          return;
        }

        const expectedRole = context.companyType === "SUPPLIER" ? "supplier" : "demandant";
        if (expectedRole !== role) {
          navigate(routePaths[`${expectedRole}Dashboard`](lang), { replace: true });
          return;
        }

        setOperationalAccess(true);
      })
      .catch(() => navigate(routePaths.home(lang), { replace: true }))
      .finally(() => {
        if (current) setAccessLoading(false);
      });

    return () => {
      current = false;
    };
  }, [lang, navigate, role]);

  useEffect(() => {
    if (!mobileOpen) {
      if (wasMobileOpen.current) mobileMenuButtonRef.current?.focus();
      wasMobileOpen.current = false;
      return;
    }

    wasMobileOpen.current = true;
    closeButtonRef.current?.focus();

    function handleKeyboardNavigation(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter(
        (element) => element.getClientRects().length > 0,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => window.removeEventListener("keydown", handleKeyboardNavigation);
  }, [mobileOpen]);

  function closeMobileNavigation() {
    setMobileOpen(false);
  }

  if (accessLoading || !operationalAccess) return null;

  return (
    <div className="flex min-h-screen bg-input-bg">
      {mobileOpen && (
        <button type="button" aria-hidden="true" tabIndex={-1} onClick={closeMobileNavigation} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
      )}

      <aside
        ref={sidebarRef}
        id="saas-navigation"
        className={`fixed inset-y-0 left-0 z-40 h-screen w-64 shrink-0 flex-col border-r border-input-outline bg-white transition-transform duration-350 lg:sticky lg:top-0 ${
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:flex lg:translate-x-0"
        } ${collapsed ? "lg:w-16" : "lg:w-64"}`}>
        <div
          className={`flex h-14 shrink-0 items-center border-b border-input-outline px-4 ${sidebarCollapsed ? "lg:justify-center" : "justify-between"}`}>
          <Link to={routePaths[`${role}Dashboard`](lang)} onClick={closeMobileNavigation} aria-label="Solaria" className="font-bold text-title">
            {sidebarCollapsed ? <span className="hidden lg:inline">S</span> : "Solaria"}
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t("shell.closeMenu")}
            onClick={closeMobileNavigation}
            className="flex size-9 items-center justify-center rounded-medium hover:bg-input-bg lg:hidden">
            <Icon name="x" size={20} />
          </button>
        </div>

        <SaaSNavigation groups={saasNavigation[role]} lang={lang} collapsed={sidebarCollapsed} onNavigate={closeMobileNavigation} />

        <div className="hidden border-t border-input-outline p-3 lg:block">
          <button
            type="button"
            aria-label={collapsed ? t("shell.expandSidebar") : t("shell.collapseSidebar")}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((current) => !current)}
            className={`flex min-h-10 w-full items-center gap-3 rounded-medium px-3 py-2 text-black hover:bg-input-bg ${collapsed ? "justify-center" : ""}`}>
            <Icon name="chevronLeft" size={20} className={`transition-transform duration-350 ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>{t("shell.collapseSidebar")}</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col" inert={mobileOpen}>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-input-outline bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-label={t("shell.openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="saas-navigation"
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center rounded-medium hover:bg-input-bg lg:hidden">
              <Icon name="menu" size={20} />
            </button>
            <span className="font-semi-bold">{t(`roles.${role}`)}</span>
          </div>
          <LanguageSwitcher />
        </header>

        <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
