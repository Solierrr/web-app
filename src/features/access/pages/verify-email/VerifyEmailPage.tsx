import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StatusPage from "@@/layout/status-page/StatusPage";
import { routePaths } from "@/config/i18n/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getAccountIdentity, confirmEmailVerification, requestEmailVerification } from "@/features/access/access.credentials.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getAccessErrorMessage } from "@/features/access/access.utils";
import Alert from "@@/feedback/alert/Alert";
import { PrimaryButton, WhiteSoftButton } from "@@/ui/button/Button.presets";

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
  const [error, setError] = useState((location.state as { verificationError?: string } | null)?.verificationError ?? "");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const destination = returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang);

  useEffect(() => {
    if (isAlwaysMockMode("AUTH")) return;
    let active = true;
    getAccountIdentity()
      .then((account) => {
        if (active) setVerified(account.emailVerified);
      })
      .catch((failure) => {
        if (active) setError(getAccessErrorMessage(failure, t("errors.UNAVAILABLE")));
      });
    return () => {
      active = false;
    };
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
      if (token) {
        await confirmEmailVerification(token);
        setSearch({}, { replace: true });
      }
      const account = await getAccountIdentity();
      setVerified(account.emailVerified);
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("errors.UNAVAILABLE")));
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try {
      await requestEmailVerification();
      setSent(true);
      setCooldown(60);
    } catch (failure) {
      setError(getAccessErrorMessage(failure, t("email.unavailable")));
    } finally {
      setBusy(false);
    }
  }

  const status = t(verified ? "email.verified" : sent ? "email.sent" : "email.pending");
  return (
    <StatusPage
      title={t("email.title")}
      message={<span role="status">{status}</span>}
      busy={busy}
      actions={
        verified ? (
          <PrimaryButton
            rounded
            variant="soft"
            type="button"
            content={t("email.continue")}
            description={t("email.continue")}
            onClick={() => navigate(destination, { replace: true })}
            className="min-h-12"
          />
        ) : (
          <>
            <PrimaryButton
              rounded
              variant="soft"
              type="button"
              disabled={busy}
              content={t(token ? "email.confirm" : "email.check")}
              description={t(token ? "email.confirm" : "email.check")}
              onClick={() => void check()}
              className="min-h-12"
            />
            <WhiteSoftButton
              rounded
              type="button"
              disabled={busy || cooldown > 0}
              onClick={() => void resend()}
              content={cooldown > 0 ? t("email.cooldown", { seconds: cooldown }) : t("email.resend")}
              description={t("email.resend")}
              className="min-h-12"
            />
          </>
        )
      }>
      {error && <Alert state="error">{error}</Alert>}
    </StatusPage>
  );
}
