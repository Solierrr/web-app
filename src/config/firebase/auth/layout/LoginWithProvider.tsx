import { loginWithGoogle, loginWithMicrosoft } from "../auth.service";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useTranslation } from "react-i18next";
import logger from "@/config/logging/logger";

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
  return <ToolbarAction icon="google" disabled={disabled} label={t("login.google")} onClick={onClick ?? handleLogin} />;
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
  return <ToolbarAction icon="microsoft" disabled={disabled} label={t("login.microsoft")} onClick={onClick ?? handleLogin} />;
}
