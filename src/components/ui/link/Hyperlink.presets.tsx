import type { ComponentProps } from "react";
import Hyperlink from "./Hyperlink";

type HyperlinkPresetProps = ComponentProps<typeof Hyperlink>;

/**
 * Orange
 *
 * Hyperlink com a cor laranja padrão da marca.
 *
 * @param props - content, url, type e demais propriedades do Hyperlink.
 */
export function OrangeHyperlink({ className, ...props }: HyperlinkPresetProps) {
  return <Hyperlink {...props} className={`text-orange ${className ?? ""}`} />;
}
