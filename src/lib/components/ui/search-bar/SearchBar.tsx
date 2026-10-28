import type { ComponentProps, ReactNode } from "react";
import GroupAction from "@@/ui/button/GroupAction";
import Input from "@@/ui/input/Input";
import Select from "@@/ui/select/Select";
import Surface from "@@/ui/surface/Surface";

interface SearchBarProps extends Omit<ComponentProps<typeof Input>, "icon" | "className"> {
  /** Ações à esquerda do campo (use `SearchBarAction`), no mesmo formato das ações da direita. */
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * SearchBar
 *
 * Campo de busca em moldura `Surface`. As `actions` (use `SearchBarAction` e `SearchBarSelect`) ocupam toda a altura
 * da moldura, à direita, separadas por divisórias finas, como o `SurfaceGroup` do gallery do api-email. O interior
 * não recorta o conteúdo, para os menus dos selects poderem abrir por cima da página.
 */
export default function SearchBar({ leading, actions, className = "", ...props }: SearchBarProps) {
  return (
    <Surface field className={`w-full ${className}`} contentClassName="flex items-stretch overflow-visible!">
      {leading && (
        <div className="flex shrink-0 items-stretch divide-x divide-operational-border/60 border-r-(length:--border-width-ui) border-solid border-border/60 [&>*:first-child]:rounded-l-full">
          {leading}
        </div>
      )}
      <div className="min-w-0 flex-1 px-2 py-1">
        <Input {...props} rounded icon={{ name: "search" }} className="w-full! bg-transparent!" />
      </div>
      {actions && (
        <div className="flex shrink-0 items-stretch divide-x divide-operational-border/60 border-l-(length:--border-width-ui) border-solid border-border/60 [&>*:last-child]:rounded-r-full">
          {actions}
        </div>
      )}
    </Surface>
  );
}

/** Botão de ação da busca: quadrado com ícone, ou com texto quando recebe `content`. Preenche toda a altura da moldura. */
export function SearchBarAction({ className = "", ...props }: ComponentProps<typeof GroupAction>) {
  const text = "content" in props && props.content;
  return <GroupAction {...props} layout={text ? "row" : "icon"} className={`h-12 min-h-0 flex-none ${text ? "px-4 py-0" : ""} ${className}`} />;
}

/** Select da busca: sem fundo nem borda próprios, preenche toda a altura e abre o menu abaixo da moldura. */
export function SearchBarSelect<T = string>(props: Omit<ComponentProps<typeof Select<T>>, "variant">) {
  return <Select<T> {...props} variant="group" />;
}
