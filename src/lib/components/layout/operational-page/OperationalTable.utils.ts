import { isValidElement, type ReactNode } from "react";

export function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (isValidElement<{ children?: ReactNode; label?: string; content?: string }>(node))
    return node.props.label ?? node.props.content ?? text(node.props.children);
  return "";
}
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
