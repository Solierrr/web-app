import { forwardRef } from "react";

interface MenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

/**
 * MenuList
 *
 * Contêiner visual compartilhado por listas flutuantes de opções (dropdown do
 * `Select`, itens do `ContextMenu`, etc.). Não define posicionamento — cada
 * consumidor adiciona isso via `className`.
 *
 * @param props - Propriedades do componente (demais atributos de `<ul>`, como `role` e `aria-label`, são repassados).
 *
 * @returns O elemento `<ul>` estilizado.
 */
export const MenuList = forwardRef<HTMLUListElement, MenuListProps>(function MenuList({ className, children, ...props }, ref) {
  return (
    <ul ref={ref} {...props} className={`overflow-hidden rounded-medium bg-white shadow-lg ${className ?? ""}`}>
      {children}
    </ul>
  );
});

interface MenuItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onClick"> {
  onSelect?:   () => void;
  disabled?:   boolean;
  selected?:   boolean;
  className?:  string;
}

/**
 * MenuItem
 *
 * Item visual compartilhado por listas flutuantes de opções. Ativa `onSelect`
 * tanto no clique quanto no teclado (Enter/Espaço), e ignora ambos quando `disabled`.
 *
 * @param props - Propriedades do componente.
 * @param props.onSelect - Chamado quando o item é ativado (clique ou Enter/Espaço).
 * @param props.disabled - Desabilita a ativação e aplica estilo acinzentado.
 * @param props.selected - Marca o item como selecionado (usado pelo `Select`; omitido, não afeta o `aria-selected`).
 *
 * @returns O elemento `<li>` estilizado.
 */
export function MenuItem({ onSelect, disabled = false, selected, className, onKeyDown, children, ...props }: MenuItemProps) {
  function handleActivate() {
    if (disabled) return;
    onSelect?.();
  }

  return (
    <li {...props}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-selected={selected}
      className={`flex items-center-safe gap-2 px-4 py-2 font-medium select-none focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-input-bg focus:bg-input-bg"} ${selected ? "bg-input-bg" : ""} ${className ?? ""}`}
      onClick={handleActivate}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleActivate();
        }
      }}>
      {children}
    </li>
  );
}
