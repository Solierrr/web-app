import { Link } from "react-router-dom";
import Icon from "@@/ui/icon/Icon";

interface HighlightProps {
  image: string;
  title: string;
  description?: string;
  /** Texto lido por leitores de tela no lugar do botão (o botão é só a seta). */
  action: string;
  to: string;
  /** `wide` ocupa a linha inteira; `tile` é o cartão que divide a linha com outros. */
  size?: "wide" | "tile";
  /** Onde o texto fica; o botão branco fica sempre no canto inferior direito. */
  align?: "top" | "bottom";
}

/**
 * Highlight
 *
 * O destaque dos feeds do marketplace, sempre no mesmo desenho: imagem de fundo, texto em cima ou embaixo e o botão
 * branco com seta no canto inferior direito. Todo o cartão é o link. Não leva produtos: só imagens fixas e de exemplo.
 *
 * @param props - image, title, description (opcional), action (texto para leitor de tela), to, size e align.
 */
export default function Highlight({ image, title, description, action, to, size = "tile", align = "top" }: HighlightProps) {
  const wide = size === "wide";
  const bottom = align === "bottom";
  return (
    <Link
      to={to}
      className={`group relative isolate flex min-w-0 flex-col overflow-hidden rounded-surface bg-operational-ink p-8 focus-visible:outline-orange ${
        wide ? "min-h-112 sm:min-h-128 sm:p-12" : "min-h-80 sm:min-h-96"
      } ${bottom ? "justify-end" : "justify-start"}`}>
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-103 motion-reduce:transform-none"
      />
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-10 ${
          bottom ? "bg-gradient-to-t from-operational-ink/80 via-operational-ink/25 to-transparent" : "bg-gradient-to-b from-operational-ink/55 via-operational-ink/10 to-transparent"
        }`}
      />
      <div className={`flex max-w-xl flex-col gap-3 ${bottom ? "pr-16" : ""}`}>
        <h2 className="whitespace-pre-line text-title font-bold leading-tight tracking-tight text-white">{title}</h2>
        {description && <p className="text-label leading-snug text-white/85">{description}</p>}
      </div>
      <span className="sr-only">{action}</span>
      <span
        aria-hidden="true"
        className={`absolute bottom-8 right-8 flex size-11 items-center justify-center rounded-full bg-white text-operational-ink transition-colors group-hover:bg-operational-hover ${wide ? "sm:bottom-12 sm:right-12" : ""}`}>
        <Icon name="chevronRight" size={18} color="currentColor" />
      </span>
    </Link>
  );
}
