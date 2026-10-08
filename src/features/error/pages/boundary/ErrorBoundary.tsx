import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ErrorPage from "../generic/Generic";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function ErrorFallback() {
  const { t } = useTranslation("commons", { keyPrefix: "errorBoundary" });
  const parameter = window.location.pathname.split("/")[1];
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;

  return (
    <ErrorPage title={t("title")} message={t("message")} actionLabel={t("back")} onReturn={() => window.location.assign(routePaths.home(lang))} />
  );
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro nao tratado na interface:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
