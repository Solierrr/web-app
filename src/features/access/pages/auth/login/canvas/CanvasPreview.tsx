import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginPage from "../LoginPage";
import Canvas from "@/lib/components/layout/access/canvas/Canvas";
import type { CanvasVariant } from "@/lib/components/layout/access/canvas/Canvas.utils";
import Hyperlink from "@@/ui/link/Hyperlink";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";

const references: Record<CanvasVariant, string> = {
  dots: "https://reactbits.dev/backgrounds/dot-grid",
  grid: "https://reactbits.dev/backgrounds/squares",
  waves: "https://reactbits.dev/backgrounds/waves",
};
const variants: CanvasVariant[] = ["dots", "grid", "waves"];

export default function CanvasPreview({ variant = "dots" }: { variant?: CanvasVariant }) {
  const { t } = useTranslation("access");
  const { lang: parameter } = useParams();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  return (
    <div className="relative bg-white">
      <nav
        aria-label={t("canvas.navigation")}
        className="flex flex-wrap items-center justify-center gap-5 bg-white px-6 py-4 lg:absolute lg:right-0 lg:top-0 lg:z-10 lg:w-1/2 lg:justify-start lg:bg-transparent lg:px-10 lg:py-8">
        {variants.map((option) => (
          <Hyperlink
            key={option}
            content={t(`canvas.${option}.title`)}
            url={`/${lang}/test/login/canvas/${option}`}
            className={variant === option ? "text-orange font-semibold" : "text-operational-muted"}
          />
        ))}
      </nav>
      <LoginPage
        background={
          <section className="relative min-h-screen w-1/2 shrink-0 overflow-hidden bg-white max-lg:hidden">
            <Canvas variant={variant} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-10 pb-10 pt-24">
              <p className="text-xs text-operational-muted">{t("canvas.preview")}</p>
              <h2 className="mt-2 text-xl font-semibold">{t(`canvas.${variant}.title`)}</h2>
              <p className="mt-2 max-w-96 text-sm text-operational-muted">{t(`canvas.${variant}.description`)}</p>
              <div className="pointer-events-auto mt-4 flex flex-wrap gap-4">
                <Hyperlink content={t("canvas.reference")} url={references[variant]} className="text-xs" />
                <Hyperlink content="Firecrawl" url="https://www.firecrawl.dev" className="text-xs" />
                <Hyperlink content="Cloudflare" url="https://www.cloudflare.com" className="text-xs" />
              </div>
            </div>
          </section>
        }
      />
      <section className="bg-white p-6 lg:hidden">
        <h2 className="text-lg font-semibold">{t(`canvas.${variant}.title`)}</h2>
        <p className="mt-2 text-sm text-operational-muted">{t(`canvas.${variant}.description`)}</p>
        <div className="relative mt-6 h-72 overflow-hidden rounded-medium">
          <Canvas variant={variant} />
        </div>
        <Hyperlink content={t("canvas.reference")} url={references[variant]} className="mt-4 inline-flex text-xs" />
      </section>
    </div>
  );
}
