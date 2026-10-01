import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function ErrorFallback({ error }: { error: Error }) {
  const { t } = useTranslation("commons", { keyPrefix: "errorBoundary" });

  return (
    <section className="flex flex-col gap-4 p-8">
      <p>{t("label")}</p>
      <h1>{t("title")}</h1>
      <p>{error.message}</p>
      <button type="button" onClick={() => window.location.reload()}>
        {t("reload")}
      </button>
    </section>
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
      return <ErrorFallback error={error} />;
    }

    return this.props.children;
  }
}
