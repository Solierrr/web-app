import type { ComponentProps, CSSProperties } from "react";
import { Link } from "react-router-dom";
import Colors from "@/lib/shared/styles/colors/colors.enum";

type ActionLinkProps = {
  content: string;
  description: string;
  variant?: "primary" | "surface";
} & Omit<ComponentProps<typeof Link>, "children" | "aria-label">;

/**
 * ActionLink
 *
 * Link com a aparência dos botões arredondados (`PrimaryButton`/`SurfaceButton` em `soft`). Mantém a semântica de
 * link, útil para navegar entre telas sem perder o visual de ação.
 *
 * @param props - content, description (nome acessível), variant (primary ou surface) e propriedades de Link.
 */
export default function ActionLink({ content, description, variant = "primary", className = "", ...props }: ActionLinkProps) {
  const surface = variant === "surface";
  const color = surface ? Colors.WHITE : Colors.ORANGE;
  const style = { backgroundColor: color, color: surface ? Colors.BLACK : Colors.WHITE, "--button-accent": surface ? Colors.GRAY : Colors.ORANGE } as CSSProperties;
  return (
    <Link
      {...props}
      aria-label={description}
      style={style}
      className={`button-soft ${surface ? "button-soft-surface" : ""} relative flex items-center-safe justify-center rounded-full px-7 py-3 font-medium select-none transition-all duration-350 hover:brightness-95 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-operational-ink motion-reduce:transition-none motion-reduce:active:scale-100 ${className}`}>
      <span className="font-semi-bold text-inherit">{content}</span>
    </Link>
  );
}
