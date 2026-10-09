import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import { routePaths } from "@/config/i18n/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getAccountIdentity, confirmEmailVerification, requestEmailVerification } from "@/features/access/access.credentials.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

export default function VerifyEmailPage() {
  const { lang: parameter } = useParams();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t } = useTranslation("deeplink");
  const [search, setSearch] = useSearchParams();
  const token = search.get("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(isAlwaysMockMode("AUTH"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const destination = returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang);

  useEffect(() => {
    if (isAlwaysMockMode("AUTH")) return;
    let active = true;
    getAccountIdentity().then((account) => { if (active) setVerified(account.emailVerified); })
      .catch(() => { if (active) setError(t("errors.UNAVAILABLE")); });
    return () => { active = false; };
  }, [t]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function check() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (token) { await confirmEmailVerification(token); setSearch({}, { replace: true }); }
      const account = await getAccountIdentity();
      setVerified(account.emailVerified);
      if (!account.emailVerified) setError(t("email.pending"));
    } catch { setError(t("errors.UNAVAILABLE")); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try { await requestEmailVerification(); setSent(true); setCooldown(60); }
    catch { setError(t("email.unavailable")); }
    finally { setBusy(false); }
  }

  return <Access heading={t("email.title")} animatedBackground={false} busy={busy} error={error}>
    <div className="flex flex-col gap-4">
      <p role="status">{t(verified ? "email.verified" : sent ? "email.sent" : "email.pending")}</p>
      {verified ? <button type="button" onClick={() => navigate(destination, { replace: true })}>{t("email.continue")}</button> : <>
        <button type="button" disabled={busy} onClick={() => void check()}>{t(token ? "email.confirm" : "email.check")}</button>
        <button type="button" disabled={busy || cooldown > 0} onClick={() => void resend()}>
          {cooldown > 0 ? t("email.cooldown", { seconds: cooldown }) : t("email.resend")}
        </button>
      </>}
    </div>
  </Access>;
}
