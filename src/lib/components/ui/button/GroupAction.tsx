import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";

type GroupActionProps = {
  icon?: IconName;
  glyph?: ReactNode;
  iconSize?: number;
  label: string;
  content?: string;
  detail?: string;
  layout?: "row" | "icon";
  active?: boolean;
} & ((Omit<ComponentProps<"button">, "children"> & { to?: never }) | Omit<ComponentProps<typeof Link>, "children">);

const BASE =
  "flex cursor-pointer items-center transition-colors duration-250 hover:bg-operational-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-operational-ink disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none";
const LAYOUTS = {
  row: "min-h-14 min-w-0 flex-1 gap-3 px-4 py-3 text-left",
  icon: "h-12 w-12 shrink-0 justify-center",
};

/**
 * GroupAction
 *
 * Ação de largura total para dentro de um `SurfaceGroup`: sem cantos próprios, o fundo de hover ocupa todo o
 * espaço do item. `row` mostra ícone, texto e uma linha de detalhe opcional; `icon` é um botão quadrado com ícone (ou texto curto, como "?").
 * Vira link quando recebe `to`. `active` marca o item como selecionado (filtros e seletores).
 *
 * @param props - icon (nome na lib) ou glyph (SVG próprio), label (nome acessível e tooltip), content, detail, layout e propriedades de button/Link.
 */
export default function GroupAction({ icon, glyph, iconSize = 20, label, content, detail, layout = "row", active, className, ...props }: GroupActionProps) {
  const classes = `${BASE} ${LAYOUTS[layout]} text-operational-ink ${active ? "bg-sidebar-active" : ""} ${className ?? ""}`;
  const children = (
    <>
      {glyph}
      {icon && <Icon name={icon} size={iconSize} className="shrink-0" />}
      {layout === "icon" && !icon && !glyph && content && <span className="text-body font-medium text-operational-ink">{content}</span>}
      {layout === "row" && (content || detail) && (
        <span className="flex min-w-0 flex-col">
          {content && <span className="truncate text-body font-medium text-operational-ink">{content}</span>}
          {detail && <span className="truncate text-sidebar text-operational-muted">{detail}</span>}
        </span>
      )}
    </>
  );

  if (props.to !== undefined) {
    return (
      <Link {...props} aria-current={active ? "true" : undefined} aria-label={label} title={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" {...props} aria-pressed={active} aria-label={label} title={label} className={classes}>
      {children}
    </button>
  );
}
