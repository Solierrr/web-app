import { useTranslation } from "react-i18next";
import { PrimaryButton } from "@@/ui/button/Button.presets";

interface LoadFailureProps {
  /** O que não carregou ("Não foi possível carregar as ofertas."); sem ele aparece o título genérico. */
  title?: string;
  onRetry: () => void;
}

/**
 * LoadFailure
 *
 * Tela de erro genérica de uma lista ou página que não carregou, mostrada só depois de as tentativas automáticas
 * acabarem (ver `retryWithBackoff`). Enquanto elas rodam, a interface fica no skeleton.
 *
 * @param props - title (opcional) e onRetry, que recomeça o carregamento.
 */
export default function LoadFailure({ title, onRetry }: LoadFailureProps) {
  const { t } = useTranslation("commons", { keyPrefix: "loadFailure" });
  return (
    <div role="alert" className="mx-auto flex w-full max-w-operational-form flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-subtitle font-semi-bold leading-tight text-operational-ink">{title ?? t("title")}</h2>
      <p className="text-label leading-relaxed text-operational-muted [overflow-wrap:anywhere]">{t("message")}</p>
      <PrimaryButton
        rounded
        variant="soft"
        type="button"
        content={t("retry")}
        description={t("retry")}
        onClick={onRetry}
        className="min-h-12 min-w-48"
      />
    </div>
  );
}
