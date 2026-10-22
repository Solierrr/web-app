import type { ComponentProps } from "react";
import Surface from "@@/ui/surface/Surface";

interface SurfaceGroupProps extends ComponentProps<"div"> {
  direction?: "vertical" | "horizontal";
  divided?: boolean;
  contentClassName?: string;
}

/**
 * SurfaceGroup
 *
 * Card de `Surface` cujos itens ocupam 100% da área interna, separados por divisórias sutis. Serve para
 * listas de ações (`GroupAction`), pílulas de ícones e grupos de campos: o item preenche o fundo até a
 * borda, então o hover não deixa folga e o arredondamento do card recorta os cantos.
 *
 * @param props - direction (vertical por padrão), divided (divisórias entre itens, ligado por padrão), className, contentClassName e demais propriedades de div.
 */
export default function SurfaceGroup({ direction = "vertical", divided = true, contentClassName = "", children, ...props }: SurfaceGroupProps) {
  const horizontal = direction === "horizontal";
  const layout = horizontal ? "flex-row items-stretch" : "flex-col";
  const dividers = divided ? `${horizontal ? "divide-x" : "divide-y"} divide-operational-border/60` : "";
  return (
    <Surface {...props} contentClassName={`flex ${layout} ${dividers} ${contentClassName}`}>
      {children}
    </Surface>
  );
}
