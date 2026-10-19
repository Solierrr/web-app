import { type FormEvent, type ReactNode, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Checkbox from "@@/ui/checkbox/Checkbox";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { login, loginWithFirebase, loginWithMockMicrosoft, linkFirebase } from "@/features/access/access.service";
import type { AuthSession } from "@/features/access/access";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { migratePassword } from "@/features/access/access.credentials.service";
import { login as loginFirebase, loginWithGoogle, loginWithMicrosoft } from "@/config/firebase/auth/auth.service";
import { LoginWithGoogle, LoginWithMicrosoft } from "@/config/firebase/auth/layout/LoginWithProvider";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getRememberedLogin, saveRememberedLogin, type RememberedLogin } from "./LoginPage.utils";
import { getAccessErrorMessage, getAccessHttpError } from "@/features/access/access.utils";
import { LoginEntryChoices, LoginShortcuts } from "./LoginPage.reusable";
import Surface from "@@/ui/surface/Surface";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";

export default function LoginPage({ background }: { background?: ReactNode } = {}) {
  const { t } = useTranslation("access");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const navigate = useNavigate();
  const location = useLocation();
  const [remembered, setRemembered] = useState(getRememberedLogin);
  const [search, setSearch] = useSearchParams();
  const [email, setEmail] = useState(remembered?.email ?? (import.meta.env.DEV ? (import.meta.env.VITE_DEV_LOGIN_EMAIL ?? "") : ""));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkProof, setLinkProof] = useState<{ token: string; email: string; method: "google" | "microsoft" } | null>(null);
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [migrationProof, setMigrationProof] = useState<string | null>(null);
  const { t: tDeeplink } = useTranslation("deeplink");
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const destination = returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang);

  function openSignIn() {
    setSearch(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("step", "signin");
        return next;
      },
      { state: location.state },
    );
  }

  function finish(session: AuthSession, method: RememberedLogin["method"]) {
    saveRememberedLogin({ email: session.email, method });
    navigate(destination, { replace: true });
  }

  async function handleProvider(method: "google" | "microsoft", savedEmail?: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    setLinkProof(null);
    setMigrationProof(null);
    setLinkConfirmed(false);
    let candidate: { token: string; email: string; method: "google" | "microsoft" } | null = null;
    try {
      let session: AuthSession;
      if (isAlwaysMockMode("AUTH"))
        session =
          method === "microsoft" ? await loginWithMockMicrosoft() : await login({ email: savedEmail ?? `${method}@example.com`, password: "" });
      else {
        const user = await (method === "google" ? loginWithGoogle(savedEmail) : loginWithMicrosoft(savedEmail));
        const token = await user.getIdToken();
        candidate = { token, email: user.email ?? "", method };
        session = await loginWithFirebase(token);
      }
      finish(session, method);
    } catch (failure) {
      if (candidate && failure instanceof Error && failure.cause instanceof HttpResponseError && failure.cause.code === "ACCOUNT_LINK_REQUIRED") {
        setLinkProof(candidate);
        setLinkConfirmed(false);
        setEmail(candidate.email);
        openSignIn();
        setNotice(tDeeplink("link.explanation"));
      } else setError(getAccessErrorMessage(failure, t("feedback.providerFailed")));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (busy) return;
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const normalizedEmail = email.trim();
    setBusy(true);
    setError(null);
    try {
      let session: AuthSession;
      if (linkProof) {
        if (!linkConfirmed) {
          setError(tDeeplink("link.confirm"));
          return;
        }
        session = await linkFirebase(linkProof.email, password, linkProof.token);
        finish(session, linkProof.method);
        setLinkProof(null);
        return;
      }
      if (migrationProof) {
        await migratePassword(migrationProof, password);
        session = await login({ email: normalizedEmail, password });
        setMigrationProof(null);
        finish(session, "password");
        return;
      }
      try {
        session = await login({ email: normalizedEmail, password });
      } catch (failure) {
        const response = getAccessHttpError(failure);
        if (response?.status !== 401 || response.code !== "INVALID_CREDENTIALS") throw failure;
        const { user } = await loginFirebase(normalizedEmail, password);
        const proof = await user.getIdToken(true);
        await loginWithFirebase(proof);
        setMigrationProof(proof);
        setNotice(tDeeplink("migration.choosePassword"));
        openSignIn();
        return;
      }
      finish(session, "password");
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("feedback.signInFailed")));
    } finally {
      setBusy(false);
    }
  }

  function chooseAnotherAccount() {
    setMigrationProof(null);
    setLinkProof(null);
    setLinkConfirmed(false);
    setEmail("");
    setError(null);
    setNotice(null);
    openSignIn();
  }

  function forgetAccount() {
    saveRememberedLogin(null);
    setRemembered(null);
    setEmail("");
    setError(null);
    setNotice(null);
  }

  if (search.get("step") !== "signin")
    return (
      <Access
        key="entry"
        topAction={<LanguageSwitcher />}
        heading={t("entry.title")}
        helperText={t("entry.description")}
        logoWidth={7}
        logoInteractive
        background={background}
        busy={busy}
        error={error}
        notice={notice}
        footer={<LoginShortcuts lang={lang} state={location.state} policiesOnly />}>
        <LoginEntryChoices
          lang={lang}
          state={location.state}
          remembered={remembered}
          busy={busy}
          onSignIn={chooseAnotherAccount}
          onForget={forgetAccount}
          onContinue={() => {
            if (!remembered) return;
            if (remembered.method !== "password") void handleProvider(remembered.method, remembered.email);
            else {
              setError(null);
              setNotice(null);
              setLinkProof(null);
              setMigrationProof(null);
              setLinkConfirmed(false);
              setEmail(remembered.email);
              openSignIn();
            }
          }}
        />
      </Access>
    );
  return (
    <Access
      key="signin"
      topAction={<LanguageSwitcher />}
      backAction={
        <ToolbarAction
          icon="chevronLeft"
          label={t("entry.back")}
          disabled={busy}
          onClick={() => {
            setLinkProof(null);
            setMigrationProof(null);
            setLinkConfirmed(false);
            setError(null);
            setNotice(null);
            setSearch(
              (current) => {
                const next = new URLSearchParams(current);
                next.delete("step");
                return next;
              },
              { state: location.state },
            );
          }}
        />
      }
      heading={t("login.welcome")}
      logoWidth={7}
      logoInteractive
      compact
      submitVariant="soft"
      animatedBackground
      background={background}
      busy={busy}
      error={error}
      notice={notice}
      formHeader={
        <Surface className="self-center" contentClassName="flex items-center justify-center gap-3 p-1">
          <LoginWithGoogle disabled={busy} onClick={() => void handleProvider("google")} />
          <LoginWithMicrosoft disabled={busy} onClick={() => void handleProvider("microsoft")} />
        </Surface>
      }
      fields={[
        {
          name: "email",
          type: "email",
          label: t("login.emailLabel"),
          placeholder: t("login.emailPlaceholder"),
          value: email,
          onChange: (event) => setEmail(event.target.value),
          autoComplete: "username",
          readOnly: Boolean(migrationProof || linkProof),
          autoFocus: !remembered || email !== remembered.email,
        },
        {
          name: "password",
          label: t("login.passwordLabel"),
          placeholder: migrationProof ? tDeeplink("migration.newPassword") : t("login.passwordPlaceholder"),
          minLength: migrationProof ? 12 : undefined,
          autoComplete: migrationProof ? "new-password" : "current-password",
          defaultValue:
            import.meta.env.DEV && !migrationProof && !linkProof && email === import.meta.env.VITE_DEV_LOGIN_EMAIL
              ? import.meta.env.VITE_DEV_LOGIN_PASSWORD
              : undefined,
          password: true,
          autoFocus: Boolean(remembered && email === remembered.email),
        },
      ]}
      beforeSubmit={
        <>
          {linkProof && (
            <Checkbox
              label={tDeeplink("link.confirm")}
              checked={linkConfirmed}
              disabled={busy}
              onChange={(event) => setLinkConfirmed(event.target.checked)}
            />
          )}
        </>
      }
      submitLabel={linkProof ? tDeeplink("link.submit") : t("login.signIn")}
      onSubmit={handleSubmit}
      footer={
        <div className="flex w-full flex-col items-center gap-6">
          <LoginShortcuts lang={lang} state={location.state} />
        </div>
      }
    />
  );
}
