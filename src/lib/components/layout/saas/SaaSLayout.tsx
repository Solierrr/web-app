import SidePanel from "@@/layout/side-panel/SidePanel";
import { useSidePanel } from "@@/layout/side-panel/SidePanel.context";
import { SidePanelProvider } from "@@/layout/side-panel/SidePanel.provider";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "@@/layout/sidebar/Sidebar";
import { SIDEBAR_ICON_SIZE } from "@@/layout/sidebar/Sidebar.styles";
import Icon from "@@/ui/icon/Icon";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Loading from "@@/helpers/accessibility/loading/Loading";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";
import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { logout } from "@/features/access/access.service";
import { clearAuthSession, getAuthSession } from "@/lib/shared/auth/authToken.utils";
import SaaSAccount from "./account/SaaSAccount";
import { ActiveContextProvider, useActiveContext } from "@/lib/shared/context/ActiveContext";
import { CompanyStatus } from "@/features/companies/company.enum";
import { SaaSNavigation } from "./SaaSLayout.reusable";
import { getOperationalNavigation } from "./SaaSLayout.presets";
import ChatbotPage from "@/features/messages/pages/ChatbotPage";
import OperationalAssistant from "@/features/assistant/pages/OperationalAssistant";
import SaaSContext from "@@/layout/saas-context/SaaSContext";
import { rememberPage } from "@/features/dashboard/dashboard.utils";
import PageSearch from "@@/layout/page-search/PageSearch";
import NotificationCenter from "@/features/notifications/components/NotificationCenter";

function subscribeDesktop(listener: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function SaaSLayoutContent() {
  const { t } = useTranslation("saas");
  const { t: tCommons } = useTranslation("commons");
  const { panel, closePanel, busy: panelBusy } = useSidePanel();
  const contextMenu = useContextMenu();
  const { t: tAccess } = useTranslation("onboarding");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const context = useActiveContext();
  const [session, setSession] = useState(getAuthSession);
  useEffect(() => {
    const updateSession = () => setSession(getAuthSession());
    window.addEventListener("solaria:session", updateSession);
    return () => window.removeEventListener("solaria:session", updateSession);
  }, []);
  const { loading, needsContextChoice, kind, company, memberships = [], setKind, selectCompany, isPlatformAdmin } = context;
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
  const [collapsed, setCollapsed] = useState(true);
  const [mockEntryLoading, setMockEntryLoading] = useState(isAlwaysMockMode);

  useEffect(() => {
    if (!isAlwaysMockMode()) return;
    const timer = window.setTimeout(() => setMockEntryLoading(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);
  const viewKey = `${pathname}|${desktop}`;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = openKey === viewKey;
  const setOpen = (value: boolean) => setOpenKey(value ? viewKey : null);
  const [signingOut, setSigningOut] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistantButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const effectiveCollapsed = desktop && collapsed;
  const companyContext = kind === "company" && company !== null;
  const groups = getOperationalNavigation({
    company: companyContext,
    companyType: companyContext && company.status === CompanyStatus.APPROVED ? (company.type ?? null) : null,
    platformAdmin: isPlatformAdmin,
    pendingRegistration: companyContext && company.status !== CompanyStatus.APPROVED,
    can: context.can,
  });

  useEffect(() => {
    if (loading || needsContextChoice) return;
    const item = groups
      .flatMap((group) => group.items)
      .filter((entry) => entry.key !== "dashboard")
      .sort((a, b) => b.to(lang).length - a.to(lang).length)
      .find((entry) => pathname === entry.to(lang) || pathname.startsWith(`${entry.to(lang)}/`));
    if (item && item.key !== "dashboard") rememberPage(companyContext ? company.id : "personal", item.key);
  }, [pathname, lang, loading, needsContextChoice, companyContext, company, groups]);

  useEffect(() => {
    if (!open || desktop) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("button, select, a")?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
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

  if (loading || mockEntryLoading) return <Loading label={t("shell.loading")} />;

  const companies = memberships.length ? memberships : company ? [{ id: company.id, name: company.tradeName }] : [];
  return (
    <div
      className="operational-shell flex flex-col lg:flex-row h-dvh overflow-hidden bg-operational-shell"
      onContextMenu={(event) => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        contextMenu.open([{ label: tCommons("actions.back"), onClick: () => navigate(-1) }], event.clientX, event.clientY);
      }}>
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
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-250 ease-in-out motion-reduce:transition-none lg:static ${!desktop && !open ? "-translate-x-full pointer-events-none" : "translate-x-0"}`}>
        <Sidebar
          hideToggle
          collapsed={effectiveCollapsed}
          onCollapsedChange={setCollapsed}
          collapseLabel={t("shell.collapseSidebar")}
          expandLabel={t("shell.expandSidebar")}
          header={
            <>
              <SaaSContext collapsed={effectiveCollapsed} onToggle={desktop ? () => setCollapsed(!collapsed) : undefined} />
              {!desktop && (
                <button type="button" onClick={() => setOpen(false)} className="flex min-h-11 w-full items-center gap-2 px-6 text-sidebar hover:bg-sidebar-hover">
                  <Icon name="x" size={SIDEBAR_ICON_SIZE} />
                  {t("shell.closeMenu")}
                </button>
              )}
            </>
          }
          navigation={
            <SaaSNavigation
              before={
                <PageSearch
                  showTrigger={false}
                  groups={groups}
                  lang={lang}
                  context={companyContext ? company.id : "personal"}
                  collapsed={effectiveCollapsed}
                  onNavigate={() => setOpen(false)}
                />
              }
              groups={groups}
              lang={lang}
              context={companyContext ? company.id : "personal"}
              collapsed={effectiveCollapsed}
              onNavigate={() => setOpen(false)}
            />
          }>
          {null}
        </Sidebar>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="navbar-frame bg-operational-shell! justify-between gap-4">
          <ToolbarAction
            ref={menuButton}
            icon="menu"
            iconSize={SIDEBAR_ICON_SIZE}
            label={t("shell.openMenu")}
            content={t("shell.openMenu")}
            aria-controls="operational-sidebar"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="lg:hidden"
          />
          <div className="ml-auto flex items-center gap-2">
            <ToolbarAction
              to={routePaths.home(lang)}
              icon="layoutGrid"
              iconSize={SIDEBAR_ICON_SIZE}
              label={t("shell.exploreCatalog")}
              content={t("shell.exploreCatalog")}
              hideContentOnMobile
            />
            <NotificationCenter />
            <ToolbarAction
              ref={assistantButton}
              icon="sparkles"
              iconSize={SIDEBAR_ICON_SIZE}
              iconGradient="orange"
              label={t("navigation.items.chatbot")}
              aria-controls="operational-assistant"
              aria-expanded={assistantOpen}
              onClick={() => {
                setOpen(false);
                closePanel();
                setAssistantOpen(true);
              }}
            />
            <SaaSAccount signingOut={signingOut} onLogout={handleLogout} email={session?.email ?? ""} managedCompanyName={session?.managedByCompany?.name} />
          </div>
        </header>
        <div
          id="operational-content"
          tabIndex={-1}
          className="mr-2 mb-2 min-h-0 min-w-0 flex-1 overflow-y-auto scrollbar-none rounded-hard bg-operational-surface sm:mr-4 sm:mb-4">
          {needsContextChoice ? (
            <OperationalPage title={tAccess("chooseContext")} compact centered sideBackground>
              <ToolbarAction
                icon="user"
                label={tAccess("personalContext")}
                content={tAccess("personalContext")}
                onClick={() => setKind("personal")}
                backgroundColor="var(--color-white)"
                className="min-h-12 w-full! justify-start!"
              />
              {companies.map((item) => (
                <ToolbarAction
                  key={item.id}
                  icon="building"
                  label={item.name}
                  content={item.name}
                  onClick={() => selectCompany?.(item.id)}
                  backgroundColor="var(--color-white)"
                  className="min-h-12 w-full! justify-start!"
                />
              ))}
            </OperationalPage>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
      <SidePanel
        open={!!panel || assistantOpen}
        wide={!!panel}
        closeDisabled={panelBusy}
        title={panel?.title ?? t("navigation.items.chatbot")}
        closeLabel={panel ? tCommons("actions.close") : t("shell.closeAssistant")}
        trigger={panel?.trigger}
        onClose={() => {
          if (panel) closePanel();
          else setAssistantOpen(false);
        }}>
        <div className={panel ? "hidden" : "flex min-h-0 flex-1 flex-col px-3 pb-3"}>
          {companyContext ? (
            <OperationalAssistant embedded active={assistantOpen && !panel} />
          ) : (
            <ChatbotPage embedded active={assistantOpen && !panel} />
          )}
        </div>
        {panel?.content}
      </SidePanel>
    </div>
  );
}

export function SaaSLayout() {
  return (
    <ContextMenuProvider>
      <ActiveContextProvider>
        <SidePanelProvider>
          <SaaSLayoutContent />
        </SidePanelProvider>
      </ActiveContextProvider>
    </ContextMenuProvider>
  );
}
