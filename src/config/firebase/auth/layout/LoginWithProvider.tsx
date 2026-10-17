import { loginWithGoogle, loginWithMicrosoft } from "../auth.service";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import logger from "@/config/logging/logger";

const classes =
  "flex size-12 items-center justify-center rounded-medium cursor-pointer transition-colors duration-200 hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-50";
interface ProviderProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function LoginWithGoogle({ onClick, disabled }: ProviderProps = {}) {
  const { t } = useTranslation("access");
  async function handleLogin() {
    try {
      await loginWithGoogle();
    } catch (error) {
      logger.error("Google sign-in failed", error);
    }
  }
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-label={t("login.google")}
      title={t("login.google")}
      onClick={onClick ?? handleLogin}>
      <FcGoogle size={32} aria-hidden="true" />
    </button>
  );
}

export function LoginWithMicrosoft({ onClick, disabled }: ProviderProps = {}) {
  const { t } = useTranslation("access");
  async function handleLogin() {
    try {
      await loginWithMicrosoft();
    } catch (error) {
      logger.error("Microsoft sign-in failed", error);
    }
  }
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-label={t("login.microsoft")}
      title={t("login.microsoft")}
      onClick={onClick ?? handleLogin}>
      <FaMicrosoft size={32} aria-hidden="true" />
    </button>
  );
}
