import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
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
  return <Access heading={t("mobile.title")} animatedBackground={false} busy={busy}>
    <div className="flex flex-col gap-4">
      {error && <p role="alert">{t(`errors.${error}`, { defaultValue: t("errors.UNAVAILABLE") })}</p>}
      {cancelled ? <p role="status">{t("mobile.cancelled")}</p> : callback ? <>
        <p>{t("mobile.opening")}</p>
        <a href={callback} rel="noreferrer" className="text-orange underline">{t("mobile.open")}</a>
        <p>{t("mobile.fallback")}</p>
        {import.meta.env.VITE_MOBILE_INSTALL_URL && <a href={import.meta.env.VITE_MOBILE_INSTALL_URL} rel="noreferrer">{t("mobile.install")}</a>}
      </> : transaction ? <>
        <p>{t("mobile.professionalOnly")}</p>
        {expired ? <p role="alert">{t("errors.TRANSACTION_EXPIRED")}</p> : transaction.eligible ?
          <button type="button" disabled={busy} onClick={() => void confirm()} className="rounded-xl bg-orange px-4 py-3 text-white">
            {t("mobile.continueAs", { email: transaction.email })}
          </button> : <>
            <p role="status">{t("mobile.ineligible")}</p>
            {!transaction.emailVerified && <Link to={routePaths.verifyEmail(lang)} state={{ returnTo }}>{t("mobile.verify")}</Link>}
            <Link to={routePaths.profileOnboardingProfessional(lang)} state={{ returnTo }}>
              {t("mobile.registration")}
            </Link>
          </>}
        <button type="button" disabled={busy} onClick={() => void switchAccount()}>{t("mobile.switch")}</button>
        <button type="button" disabled={busy} onClick={() => void cancel()}>{t("mobile.cancel")}</button>
      </> : !error && <p role="status">{t("loading")}</p>}
    </div>
  </Access>;
}
