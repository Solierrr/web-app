import { Link } from "react-router-dom";
import { useState } from "react";

export interface EntityCardItem {
  id: string;
  name: string;
  avatarUrl?: string;
  subtitle?: string;
  href: string;
}

interface EntityCardProps {
  item: EntityCardItem;
  className?: string;
  variant?: "profile" | "product";
}

/**
 * EntityCard
 *
 * Cartão compartilhado por listagens de "entidades com foto de perfil"
 * (profissionais e empresas, hoje) — foto circular, nome e um subtítulo
 * opcional (ex.: profissão, cidade). Usado tanto pelo `EntityCorridor` quanto
 * diretamente nas páginas de busca.
 *
 * @param props.item - Dados do cartão (id, nome, foto, subtítulo e o link de destino).
 * @param props.className - Classes adicionais para ajustar o layout no container pai.
 */
export default function EntityCard({ item, className, variant = "profile" }: EntityCardProps) {
  const [failedImage, setFailedImage] = useState<string>();
  const hasImage = item.avatarUrl && failedImage !== item.avatarUrl;
  if (variant === "product")
    return (
      <Link to={item.href} className={`group flex min-w-0 flex-col gap-3 rounded-medium focus-visible:outline-operational-ink ${className ?? ""}`}>
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-medium bg-input-bg p-4">
          {hasImage && (
            <img
              src={item.avatarUrl}
              alt={item.name}
              loading="lazy"
              onError={() => setFailedImage(item.avatarUrl)}
              className="h-full w-full object-contain transition-transform duration-250 group-hover:scale-105 motion-reduce:transform-none"
            />
          )}
        </div>
        <p className="line-clamp-2 text-body font-semi-bold leading-6">{item.name}</p>
        {item.subtitle && <p className="text-body text-operational-muted">{item.subtitle}</p>}
      </Link>
    );
  return (
    <Link to={item.href} className={`flex flex-col items-center gap-2 text-center ${className ?? ""}`}>
      {hasImage ? (
        <img
          src={item.avatarUrl}
          alt={item.name}
          loading="lazy"
          onError={() => setFailedImage(item.avatarUrl)}
          className="aspect-square w-full rounded-full bg-input-bg object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-square w-full items-center justify-center rounded-full bg-input-bg text-label font-semi-bold text-operational-muted">
          {item.name.trim().charAt(0).toLocaleUpperCase()}
        </div>
      )}
      <p className="font-medium">{item.name}</p>
      {item.subtitle && <p className="text-input-text">{item.subtitle}</p>}
    </Link>
  );
}
