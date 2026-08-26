import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
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
      return (
        <section className="space-y-5 p-10">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Erro
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-950">
              Algo deu errado
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              {error.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Recarregar pagina
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
