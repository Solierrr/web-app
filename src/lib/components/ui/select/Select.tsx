import { useEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";

export type SelectOption<T = string> = string | readonly [label: string, value: T];

function getOptionLabel<T>(option: SelectOption<T>): string {
  return typeof option === "string" ? option : option[0];
}

function getOptionValue<T>(option: SelectOption<T>): T {
  return typeof option === "string" ? (option as unknown as T) : option[1];
}

interface SelectProps<T> {
  name: string;
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T | undefined) => void;
  placeholder?: string;
  rounded?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  /** `group`: sem fundo nem borda próprios, preenche a altura do contêiner (usado dentro de `SearchBar`). */
  variant?: "field" | "group" | "plain";
  /** Ícone à esquerda do valor (variante `plain`). */
  icon?: IconName;

  className?: string;
}

export function NativeSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { name: string }) {
  return (
    <select
      {...props}
      className={`min-h-10 rounded-medium border border-operational-border bg-input-bg px-4 py-2 font-medium text-black cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-operational-ink disabled:opacity-50 ${className}`}
    />
  );
}

/**
 * Select
 *
 * Dropdown com opções próprias (não usa o `<select>` nativo, já que o menu de
 * opções dele não é estilizável de forma consistente entre navegadores).
 *
 * @param props - Propriedades do componente.
 * @param props.name - Nome e rótulo acessível do campo.
 * @param props.options - Lista de opções: cada item é uma string (rótulo == valor) ou uma tupla `[rótulo, valor]`.
 * @param props.value - Valor selecionado (uso controlado).
 * @param props.defaultValue - Valor selecionado inicialmente (uso não controlado).
 * @param props.onChange - Chamado com o valor da opção escolhida, ou `undefined` quando a seleção é limpa.
 * @param props.placeholder - Texto exibido quando nenhuma opção está selecionada.
 * @param props.rounded - Define se o campo terá bordas completamente arredondadas.
 * @param props.disabled - Desabilita a abertura do dropdown.
 *
 * @returns O componente de select renderizado.
 */
export default function Select<T = string>({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  rounded = false,
  disabled = false,
  clearable = true,
  variant = "field",
  icon,
  className,
}: SelectProps<T>) {
  const grouped = variant === "group";
  const plain = variant === "plain";
  const { t } = useTranslation("commons", { keyPrefix: "select" });
  const resolvedPlaceholder = placeholder ?? t("placeholder");

  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((option) => getOptionValue(option) === selectedValue);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(option: SelectOption<T>) {
    const optionValue = getOptionValue(option);
    setInternalValue(optionValue);
    onChange?.(optionValue);
    setOpen(false);
  }

  function handleClear() {
    setInternalValue(undefined);
    onChange?.(undefined);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative flex ${plain ? "w-full" : "w-fit"} ${grouped ? "self-stretch" : ""} ${className ?? ""}`}>
      <div
        className={`flex w-full items-center-safe justify-between ${plain ? "h-11 lg:h-9 gap-2 rounded-small bg-transparent px-3! text-sidebar leading-5 transition-colors duration-250 hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-operational-ink motion-reduce:transition-none" : grouped ? "h-12 gap-3 rounded-[inherit] bg-transparent transition-colors duration-250 hover:bg-operational-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-operational-ink motion-reduce:transition-none" : `gap-8 bg-input-bg py-2 ${rounded ? "rounded-full" : "rounded-medium"}`} ${selectedOption ? "pl-3 pr-4" : "px-4"} text-black font-medium cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        onClick={() => !disabled && setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((isOpen) => !isOpen);
          }
        }}>
        <span className="flex min-w-0 items-center-safe gap-2">
          {icon && <Icon name={icon} size={18} color="currentColor" className="shrink-0 text-operational-muted" />}
          {selectedOption && clearable && (
            <button
              type="button"
              aria-label={t("clearSelection")}
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className="flex animate-fade-in">
              <Icon name="x" color={Colors.INPUTICON} className="cursor-pointer" />
            </button>
          )}

          <span className={`font-medium ${selectedOption ? "" : "text-input-text"} select-none`}>
            {selectedOption ? getOptionLabel(selectedOption) : resolvedPlaceholder}
          </span>
        </span>
        <Icon className={`transition-transform ${open ? "rotate-180" : ""}`} name="chevronDown" color={Colors.INPUTICON} />
      </div>

      {open && (
        <MenuList
          className={`absolute z-10 ${plain ? "left-0 top-full mt-1 w-full" : grouped ? "right-0 top-full mt-3 w-max min-w-56" : "mt-1 w-full"}`}
          role="listbox"
          aria-label={name}>
          {options.map((option, index) => {
            const isSelected = getOptionValue(option) === selectedValue;

            return (
              <MenuItem
                key={index}
                role="option"
                selected={isSelected}
                onSelect={() => handleSelect(option)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false);
                }}>
                {getOptionLabel(option)}
              </MenuItem>
            );
          })}
        </MenuList>
      )}
    </div>
  );
}
