import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@@/layout/sidebar/Sidebar";
import Icon from "@@/ui/icon/Icon";
import OperationalLoading from "@@/feedback/operational-loading/OperationalLoading";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { logout } from "@/features/access/access.service";
import { clearAuthSession } from "@/lib/shared/auth/authToken.utils";
import { ActiveContextProvider, useActiveContext } from "@/lib/shared/context/ActiveContext";
import { CompanyStatus } from "@/features/companies/company.enum";
import { SaaSAccountNavigation, SaaSNavigation } from "./SaaSLayout.reusable";
import { getOperationalNavigation } from "./SaaSLayout.presets";
import SaaSContextIndicator from "@/lib/components/layout/saas-context/SaaSContextIndicator";
import SaaSContext from "@@/layout/saas-context/SaaSContext";
import { rememberPage } from "@/features/dashboard/dashboard.utils";

function subscribeDesktop(listener: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function SaaSLayoutContent() {
  const { t } = useTranslation("saas");
  const { t: tAccess } = useTranslation("onboarding");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const context = useActiveContext();
  const { loading, needsContextChoice, kind, company, memberships = [], setKind, selectCompany, isPlatformAdmin } = context;
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("solaria.sidebar.collapsed") === "true");
  const viewKey = `${pathname}|${desktop}`;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = openKey === viewKey;
  const setOpen = (value: boolean) => setOpenKey(value ? viewKey : null);
  const [signingOut, setSigningOut] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const effectiveCollapsed = desktop && collapsed;
  const companyContext = kind === "company" && company !== null;
  const groups = getOperationalNavigation({
    company: companyContext,
    companyType: companyContext && company.status === CompanyStatus.APPROVED ? (company.type ?? null) : null,
    platformAdmin: isPlatformAdmin,
    can: context.can,
  });

  useEffect(() => {
    if (loading || needsContextChoice) return;
    const item = groups.flatMap((group) => group.items).find((entry) => pathname === entry.to(lang));
    if (item && item.key !== "dashboard") rememberPage(companyContext ? company.id : "personal", item.key);
  }, [pathname, lang, loading, needsContextChoice, companyContext, company, groups]);

  useEffect(() => {
    if (!open || desktop) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("button, select, a")?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(
        drawer.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), select:not([disabled])") ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      menuButton.current?.focus();
    };
  }, [open, desktop]);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      clearAuthSession();
      navigate(routePaths.login(lang), { replace: true });
    }
  }

  if (loading) return <OperationalLoading />;

  const companies = memberships.length ? memberships : company ? [{ id: company.id, name: company.tradeName }] : [];
  return (
    <div className="operational-shell flex h-dvh overflow-hidden bg-operational-surface">
      <a href="#operational-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">
        {t("shell.skipContent")}
      </a>
      {open && !desktop && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={t("shell.closeMenu")}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/20"
        />
      )}
      <div
        id="operational-sidebar"
        ref={drawer}
        role={!desktop && open ? "dialog" : undefined}
        aria-modal={!desktop && open ? true : undefined}
        aria-label={t("navigation.label")}
        inert={!desktop && !open ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 border-r border-operational-border lg:static ${!desktop && !open ? "hidden" : ""}`}>
        <Sidebar
          collapsed={effectiveCollapsed}
          onCollapsedChange={(next) => {
            setCollapsed(next);
            localStorage.setItem("solaria.sidebar.collapsed", String(next));
          }}
          collapseLabel={t("shell.collapseSidebar")}
          expandLabel={t("shell.expandSidebar")}
          header={
            <>
              <SaaSContext collapsed={effectiveCollapsed} />
              {!desktop && (
                <button type="button" onClick={() => setOpen(false)} className="flex min-h-12 w-full items-center gap-3 px-6">
                  <Icon name="x" size={18} />
                  {t("shell.closeMenu")}
                </button>
              )}
            </>
          }
          navigation={<SaaSNavigation groups={groups} lang={lang} collapsed={effectiveCollapsed} onNavigate={() => setOpen(false)} />}
          footer={
            <SaaSAccountNavigation
              lang={lang}
              collapsed={effectiveCollapsed}
              signingOut={signingOut}
              onNavigate={() => setOpen(false)}
              onLogout={handleLogout}
            />
          }>
          {null}
        </Sidebar>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-operational-border bg-white px-4 sm:px-8">
          <button
            ref={menuButton}
            type="button"
            aria-controls="operational-sidebar"
            aria-expanded={open}
            aria-label={t("shell.openMenu")}
            onClick={() => setOpen(true)}
            className="flex min-h-10 items-center gap-2 lg:hidden">
            <Icon name="menu" size={20} />
            <span className="text-lower">{t("shell.openMenu")}</span>
          </button>
          <SaaSContextIndicator />
          <Link
            to={routePaths.settings(lang)}
            aria-label={t("navigation.items.settings")}
            title={t("navigation.items.settings")}
            className="rounded-small p-2 hover:bg-operational-hover">
            <Icon name="user" size={18} />
          </Link>
        </header>
        <div id="operational-content" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {needsContextChoice ? (
            <OperationalPage title={tAccess("chooseContext")} compact>
              <button
                type="button"
                className="rounded-small border border-operational-border bg-white p-4 text-left hover:bg-operational-hover"
                onClick={() => setKind("personal")}>
                {tAccess("personalContext")}
              </button>
              {companies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="rounded-small border border-operational-border bg-white p-4 text-left hover:bg-operational-hover"
                  onClick={() => selectCompany?.(item.id)}>
                  {item.name}
                </button>
              ))}
            </OperationalPage>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}

export function SaaSLayout() {
  return (
    <ActiveContextProvider>
      <SaaSLayoutContent />
    </ActiveContextProvider>
  );
}
