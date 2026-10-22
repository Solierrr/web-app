import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusPage from "@@/layout/status-page/StatusPage";
import Alert from "@@/feedback/alert/Alert";
import ActionLink from "@@/ui/button/ActionLink";
import { PrimaryButton, SurfaceButton, WhiteSoftButton } from "@@/ui/button/Button.presets";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { logout } from "@/features/access/access.service";
import { authorizeMobile, cancelMobile, inspectMobile, MobileFlowError, type MobileTransaction } from "./mobile.service";

export default function Mobile() {
  const { lang: parameter } = useParams();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t } = useTranslation("deeplink");
  const location = useLocation();
  const [search] = useSearchParams();
  const id = search.get("transaction") ?? "";
  const [transaction, setTransaction] = useState<MobileTransaction | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [callback, setCallback] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const session = getAuthSession();
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!session || signedOut) return;
    let active = true;
    inspectMobile(id).then((result) => { if (active) setTransaction(result); })
      .catch((failure) => { if (active) setError(failure instanceof MobileFlowError ? failure.code : "UNAVAILABLE"); });
    return () => { active = false; };
  }, [id, session?.accessToken, signedOut]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!transaction) return;
    const remaining = new Date(transaction.expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(remaining, 0) + 1);
    return () => window.clearTimeout(timer);
  }, [transaction]);

  async function confirm() {
    if (busy || callback || !transaction?.eligible) return;
    setBusy(true);
    setError("");
    try {
      const result = await authorizeMobile(id);
      setCallback(result.callbackUrl);
      window.location.assign(result.callbackUrl);
    } catch (failure) {
      setError(failure instanceof MobileFlowError ? failure.code : "UNAVAILABLE");
    } finally { setBusy(false); }
  }

  async function switchAccount() {
    setBusy(true);
    try { await logout(); setSignedOut(true); }
    catch { setError("UNAVAILABLE"); }
    finally { setBusy(false); }
  }

  async function cancel() {
    setBusy(true);
    try { await cancelMobile(id); setCancelled(true); }
    catch { setError("UNAVAILABLE"); }
    finally { setBusy(false); }
  }

  if (!session || signedOut) return <Navigate to={routePaths.login(lang)} state={{ returnTo }} replace />;
  const expired = transaction !== null && new Date(transaction.expiresAt).getTime() <= now;
  const errorText = error ? t(`errors.${error}`, { defaultValue: t("errors.UNAVAILABLE") }) : "";
  const accountActions = (
    <>
      <WhiteSoftButton type="button" rounded content={t("mobile.switch")} description={t("mobile.switch")} disabled={busy} onClick={() => void switchAccount()} className="min-h-12" />
      <SurfaceButton type="button" rounded content={t("mobile.cancel")} description={t("mobile.cancel")} disabled={busy} onClick={() => void cancel()} className="min-h-12" />
    </>
  );

  if (cancelled) return <StatusPage title={t("mobile.title")} message={<span role="status">{t("mobile.cancelled")}</span>} />;

  if (callback)
    return (
      <StatusPage
        title={t("mobile.title")}
        message={t("mobile.opening")}
        actions={
          <>
            <PrimaryButton
              rounded
              variant="soft"
              type="button"
              content={t("mobile.open")}
              description={t("mobile.open")}
              onClick={() => window.location.assign(callback)}
              className="min-h-12"
            />
            {import.meta.env.VITE_MOBILE_INSTALL_URL && (
              <SurfaceButton
                type="button"
                rounded
                content={t("mobile.install")}
                description={t("mobile.install")}
                onClick={() => window.location.assign(import.meta.env.VITE_MOBILE_INSTALL_URL)}
                className="min-h-12"
              />
            )}
          </>
        }>
        <p className="text-center text-body text-operational-muted">{t("mobile.fallback")}</p>
      </StatusPage>
    );

  if (!transaction)
    return (
      <StatusPage title={t("mobile.title")} message={error ? undefined : t("loading")} busy={!error}>
        {error && <Alert state="error">{errorText}</Alert>}
      </StatusPage>
    );

  return (
    <StatusPage
      title={t("mobile.title")}
      message={t("mobile.professionalOnly")}
      busy={busy}
      actions={
        <>
          {!expired && transaction.eligible && (
            <PrimaryButton
              rounded
              variant="soft"
              type="button"
              disabled={busy}
              content={t("email.continue")}
              description={t("mobile.continueAs", { email: transaction.email })}
              onClick={() => void confirm()}
              className="min-h-12"
            />
          )}
          {!expired && !transaction.eligible && (
            <>
              {!transaction.emailVerified && (
                <ActionLink content={t("mobile.verify")} description={t("mobile.verify")} to={routePaths.verifyEmail(lang)} state={{ returnTo }} className="min-h-12" />
              )}
              <ActionLink
                variant={transaction.emailVerified ? "primary" : "surface"}
                content={t("mobile.registration")}
                description={t("mobile.registration")}
                to={routePaths.profileOnboardingProfessional(lang)}
                state={{ returnTo }}
                className="min-h-12"
              />
            </>
          )}
          {accountActions}
        </>
      }>
      <p className="text-center text-body font-medium text-operational-ink [overflow-wrap:anywhere]">{transaction.email}</p>
      {error && <Alert state="error">{errorText}</Alert>}
      {expired && <Alert state="error">{t("errors.TRANSACTION_EXPIRED")}</Alert>}
      {!expired && !transaction.eligible && <Alert state="info">{t("mobile.ineligible")}</Alert>}
    </StatusPage>
  );
}
