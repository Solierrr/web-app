import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { routePaths } from "@/config/inter/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { useTranslation } from "react-i18next";

import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { linkFirebase } from "@/features/access/access.service";
import { getCurrentFirebaseUser, reloadCurrentFirebaseUser, sendVerificationEmail } from "@/config/firebase/auth/auth.service";

const RESEND_COOLDOWN_SECONDS = 60;

type Status = "checking" | "no-account" | "pending" | "verified";

export default function VerifyEmailPage() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const { t } = useTranslation("access", { keyPrefix: "verifyEmail" });
  const [status, setStatus] = useState<Status>("checking");
  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState(false);
  const [password, setPassword] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [linked, setLinked] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    let active = true;
    reloadCurrentFirebaseUser()
      .then((user) => {
        if (!active) return;
        if (!user || user.email?.toLowerCase() !== getAuthSession()?.email?.toLowerCase()) {
          setStatus("no-account");
        } else {
          setStatus(user.emailVerified ? "verified" : "pending");
        }
      })
      .catch(() => {
        if (active) setStatus("no-account");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => clearInterval(cooldownTimer.current), []);

  async function handleResend() {
    const user = getCurrentFirebaseUser();
    if (!user || cooldown > 0) return;
    setResendError(false);
    try {
      await sendVerificationEmail(user);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      cooldownTimer.current = setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            clearInterval(cooldownTimer.current);
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } catch {
      setResendError(true);
    }
  }

  async function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = getCurrentFirebaseUser();
    const email = getAuthSession()?.email;
    if (!user || !email || user.email?.toLowerCase() !== email.toLowerCase()) return;
    setLinking(true);
    setLinkError(false);
    try {
      const idToken = await user.getIdToken();
      await linkFirebase(email, password, idToken);
      setLinked(true);
    } catch {
      setLinkError(true);
    } finally {
      setLinking(false);
    }
  }

  if (status === "checking") {
    return <OperationalPage title={t("title")} compact loading />;
  }

  if (status === "no-account") {
    return (
      <OperationalPage title={t("title")} compact>
        <p>{t("noFirebaseAccount")}</p>
        <Link to={routePaths.login(lang)}>{t("linkTitle")}</Link>
      </OperationalPage>
    );
  }

  return (
    <OperationalPage title={t("title")} compact>
      {status === "pending" ? (
        <>
          <p>{t("pending")}</p>
          {resendError ? (
            <p role="alert" className="text-red-700">
              {t("resendError")}
            </p>
          ) : null}
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={() => void handleResend()}
            className="self-start rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
            {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resend")}
          </button>
        </>
      ) : linked ? (
        <p role="status">{t("linkSuccess")}</p>
      ) : (
        <>
          <p>{t("verified")}</p>
          <p className="text-gray-600">{t("linkDescription")}</p>
          <form onSubmit={handleLinkSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              {t("linkTitle")}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="rounded-small border border-operational-border p-2"
              />
            </label>
            {linkError ? (
              <p role="alert" className="text-red-700">
                {t("linkError")}
              </p>
            ) : null}
            <button type="submit" disabled={linking} className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
              {t("linkSubmit")}
            </button>
          </form>
        </>
      )}
    </OperationalPage>
  );
}
