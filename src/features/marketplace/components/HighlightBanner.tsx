import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@@/ui/button/Button.presets";

interface HighlightBannerProps {
  image: string;
  title: string;
  description?: string;
  action: string;
  to: string;
}

/**
 * HighlightBanner
 *
 * O destaque de largura total dos feeds do marketplace (produtos, serviços): imagem de fundo, título, texto e uma ação.
 * Todo destaque desse tamanho usa este componente, para ter a mesma altura, margem, tipografia e botão.
 *
 * @param props - image, title, description (opcional), action (rótulo do botão) e to (destino).
 */
export default function HighlightBanner({ image, title, description, action, to }: HighlightBannerProps) {
  const navigate = useNavigate();
  return (
    <section className="relative flex min-h-112 min-w-0 flex-col justify-end overflow-hidden rounded-surface bg-operational-ink p-8 sm:min-h-128 sm:p-12">
      <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-operational-ink/85 via-operational-ink/30 to-transparent" />
      <div className="relative flex max-w-xl flex-col items-start">
        <h2 className="whitespace-pre-line text-title font-bold leading-tight tracking-tight text-white">{title}</h2>
        {description && <p className="mt-3 text-label leading-snug text-white/85">{description}</p>}
        <PrimaryButton variant="soft" onClick={() => navigate(to)} content={action} description={action} className="mt-6" />
      </div>
    </section>
  );
}
