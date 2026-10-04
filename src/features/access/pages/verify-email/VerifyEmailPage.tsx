import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/lib/components/layout/access/Access";
import { routePaths } from "@/config/i18n/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { linkFirebase, login } from "@/features/access/access.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import {
  getCurrentFirebaseUser,
  login as loginFirebase,
  register as registerFirebase,
  reloadCurrentFirebaseUser,
  sendVerificationEmail,
} from "@/config/firebase/auth/auth.service";

const RESEND_COOLDOWN_SECONDS = 60;
type Status = "checking" | "no-account" | "pending" | "verified" | "linked";

export default function VerifyEmailPage() {
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t } = useTranslation("access", { keyPrefix: "verifyEmail" });
  const { t: tAccess } = useTranslation("access");
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>(isAlwaysMockMode() ? "linked" : "checking");
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const destination = returnTo?.startsWith(`/${lang}/`) ? returnTo : routePaths.dashboard(lang);

  useEffect(() => {
    if (isAlwaysMockMode()) return;
    let active = true;
    reloadCurrentFirebaseUser()
      .then((user) => {
        if (!active) return;
        const matching = user?.email?.toLowerCase() === getAuthSession()?.email.toLowerCase();
        setStatus(user && matching ? (user.emailVerified ? "verified" : "pending") : "no-account");
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
    if (busy || cooldown > 0 || !user || user.email?.toLowerCase() !== getAuthSession()?.email.toLowerCase()) return;
    setBusy(true);
    setError(null);
    try {
      await sendVerificationEmail(user);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      clearInterval(cooldownTimer.current);
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
      setError(t("resendError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (busy) return;
    if (status === "linked") {
      navigate(destination, { replace: true });
      return;
    }
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const email = getAuthSession()?.email;
    setBusy(true);
    setError(null);
    try {
      if (status === "no-account" && email) {
        await login({ email, password });
        const { user } = await loginFirebase(email, password).catch(async (failure) => {
          if (failure?.code !== "auth/user-not-found" && failure?.code !== "auth/invalid-credential") throw failure;
          return registerFirebase(email, password);
        });
        if (!user.emailVerified) await sendVerificationEmail(user);
        setStatus(user.emailVerified ? "verified" : "pending");
      } else {
        const user = await reloadCurrentFirebaseUser();
        if (!user || !email || user.email?.toLowerCase() !== email.toLowerCase()) {
          setStatus("no-account");
          return;
        }
        if (!user.emailVerified) {
          setStatus("pending");
          setError(t("notConfirmed"));
          return;
        }
        if (status === "pending") {
          setStatus("verified");
          return;
        }
        await linkFirebase(email, password, await user.getIdToken(true));
        setStatus("linked");
      }
    } catch {
      setError(t("linkError"));
    } finally {
      setBusy(false);
    }
  }

  const passwordRequired = status === "verified" || status === "no-account";
  return (
    <Access
      heading={t("title")}
      animatedBackground={false}
      busy={busy || status === "checking"}
      error={error}
      fields={passwordRequired ? [{ name: "password", password: true, placeholder: tAccess("fields.password.placeholder") }] : []}
      submitLabel={status === "checking" ? undefined : status === "pending" ? t("check") : status === "linked" ? t("continue") : t("linkSubmit")}
      onSubmit={handleSubmit}
      footer={
        status === "pending" ? (
          <div className="flex flex-col gap-3">
            <button type="button" disabled={busy || cooldown > 0} onClick={() => void handleResend()}>
              {cooldown > 0 ? t("resendCooldown", { seconds: cooldown }) : t("resend")}
            </button>
            <Link to={destination}>{t("continueLater")}</Link>
          </div>
        ) : undefined
      }>
      <p role="status">
        {t(
          status === "checking"
            ? "checking"
            : status === "no-account"
              ? "noFirebaseAccount"
              : status === "pending"
                ? "pending"
                : status === "linked"
                  ? "linkSuccess"
                  : "verified",
        )}
      </p>
      {passwordRequired && <p>{t(status === "no-account" ? "resume" : "linkDescription")}</p>}
    </Access>
  );
}
