import { type FormEvent, type ReactNode, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import Button from "@@/ui/button/Button";
import Checkbox from "@@/ui/checkbox/Checkbox";
import Hyperlink from "@@/ui/link/Hyperlink";
import Colors from "@/lib/shared/styles/colors/colors.enum";
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

export default function LoginPage({ background }: { background?: ReactNode } = {}) {
  const { t } = useTranslation("access");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const navigate = useNavigate();
  const location = useLocation();
  const [remembered, setRemembered] = useState(getRememberedLogin);
  const [showForm, setShowForm] = useState(() => !remembered);
  const [remember, setRemember] = useState(() => Boolean(remembered));
  const [email, setEmail] = useState(remembered?.email ?? (import.meta.env.DEV ? (import.meta.env.VITE_DEV_LOGIN_EMAIL ?? "") : ""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkProof, setLinkProof] = useState<{ token: string; email: string; method: "google" | "microsoft" } | null>(null);
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [migrationProof, setMigrationProof] = useState<string | null>(null);
  const { t: tDeeplink } = useTranslation("deeplink");
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const destination = returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang);

  function finish(session: AuthSession, method: RememberedLogin["method"]) {
    saveRememberedLogin(remember ? { email: session.email, method } : null);
    navigate(destination, { replace: true });
  }

  async function handleProvider(method: "google" | "microsoft", savedEmail?: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
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
        setShowForm(true);
        setError(tDeeplink("link.explanation"));
      } else setError(t("login.error"));
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
      } catch {
        const { user } = await loginFirebase(normalizedEmail, password);
        const proof = await user.getIdToken(true);
        await loginWithFirebase(proof);
        setMigrationProof(proof);
        setError(tDeeplink("migration.choosePassword"));
        setShowForm(true);
        return;
      }
      finish(session, "password");
    } catch {
      setError(t("login.error"));
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
    setShowForm(true);
  }

  function forgetAccount() {
    saveRememberedLogin(null);
    setRemembered(null);
    setRemember(false);
    chooseAnotherAccount();
  }

  const rememberedView = Boolean(remembered && !showForm);
  const divider = (
    <div className="flex items-center gap-4" role="separator" aria-label={t("login.or")}>
      <span className="h-px flex-1 bg-operational-border" />
      <span className="text-body text-operational-muted">{t("login.or")}</span>
      <span className="h-px flex-1 bg-operational-border" />
    </div>
  );
  return (
    <Access
      heading={t("login.title")}
      compact
      submitVariant="soft"
      animatedBackground
      background={background}
      busy={busy}
      error={error}
      formHeader={
        rememberedView && remembered ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                content={remembered.email.length > 28 ? `${remembered.email.slice(0, 25)}…` : remembered.email}
                title={remembered.email}
                description={t("login.continueAs", { email: remembered.email })}
                icon={{ name: remembered.method === "password" ? "user" : remembered.method, inverse: true }}
                bgColor={Colors.WHITE}
                txtColor={Colors.BLACK}
                className="min-h-12 min-w-0 flex-1"
                disabled={busy}
                onClick={() => {
                  if (remembered.method !== "password") void handleProvider(remembered.method, remembered.email);
                  else {
                    setEmail(remembered.email);
                    setShowForm(true);
                  }
                }}
              />
              <Button
                type="button"
                icon={{ name: "x" }}
                description={t("login.forgetAccount")}
                bgColor={Colors.WHITE}
                txtColor={Colors.BLACK}
                disabled={busy}
                onClick={forgetAccount}
              />
            </div>
            <span className="text-center text-body text-operational-muted">
              {t("login.lastUsed")} ·{" "}
              {remembered.method === "password" ? t("login.emailMethod") : remembered.method === "google" ? "Google" : "Microsoft"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-4">
              <LoginWithGoogle disabled={busy} onClick={() => void handleProvider("google")} />
              <LoginWithMicrosoft disabled={busy} onClick={() => void handleProvider("microsoft")} />
            </div>
            {divider}
          </div>
        )
      }
      fields={
        rememberedView
          ? []
          : [
              {
                name: "email",
                type: "email",
                label: t("login.emailLabel"),
                placeholder: t("login.emailPlaceholder"),
                value: email,
                onChange: (event) => setEmail(event.target.value),
                autoComplete: "username",
                readOnly: Boolean(migrationProof || linkProof),
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
            ]
      }
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
          <Checkbox
            label={t("login.remember")}
            checked={remember}
            disabled={busy}
            onChange={(event) => {
              setRemember(event.target.checked);
              if (!event.target.checked) saveRememberedLogin(null);
            }}
            className="my-1"
          />
        </>
      }
      submitLabel={rememberedView ? undefined : linkProof ? tDeeplink("link.submit") : t("login.signIn")}
      onSubmit={handleSubmit}
      footer={
        <div className="flex w-full flex-col items-center gap-6">
          {rememberedView && (
            <>
              <div className="w-full">{divider}</div>
              <Button
                type="button"
                content={t("login.anotherAccount")}
                description={t("login.anotherAccount")}
                bgColor={Colors.WHITE}
                txtColor={Colors.BLACK}
                disabled={busy}
                onClick={chooseAnotherAccount}
              />
            </>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span className="text-body text-operational-muted">{t("login.noAccountPrefix")}</span>
              <Hyperlink content={t("login.register")} url={routePaths.register(lang)} state={location.state} className="text-body text-orange" />
            </div>
            {!rememberedView && <Hyperlink content={t("login.forgotPassword")} url={routePaths.forgotPassword(lang)} className="text-body" />}
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-body text-operational-muted">{t("login.policiesIntro")}</p>
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-1">
              <Hyperlink content={t("login.terms")} url={routePaths.termsPolicy(lang)} className="text-body underline underline-offset-4" />
              <Hyperlink content={t("login.privacy")} url={routePaths.privacyPolicy(lang)} className="text-body underline underline-offset-4" />
              <Hyperlink content={t("login.cookies")} url={routePaths.cookiePolicy(lang)} className="text-body underline underline-offset-4" />
            </div>
          </div>
        </div>
      }
    />
  );
}
