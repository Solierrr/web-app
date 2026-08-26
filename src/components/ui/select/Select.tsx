import { useEffect, useRef, useState } from "react";
import Colors from "@/domain/enum/colors";
import Icon from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";

export type SelectOption<T = string> = string | readonly [label: string, value: T];

function getOptionLabel<T>(option: SelectOption<T>): string {
  return typeof option === "string" ? option : option[0];
}

function getOptionValue<T>(option: SelectOption<T>): T {
  return typeof option === "string" ? (option as unknown as T) : option[1];
}

interface SelectProps<T> {
  name:          string;
  options:       SelectOption<T>[];
  value?:        T;
  defaultValue?: T;
  onChange?:     (value: T | undefined) => void;
  placeholder?:  string;
  rounded?:      boolean;
  disabled?:     boolean;

  className?: string;
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
export default function Select<T = string>({ name, options, value, defaultValue, onChange,
  placeholder = "Selecione...", rounded = false, disabled = false, className, }: SelectProps<T>) {

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
    <div ref={containerRef} className={`relative w-fit ${className ?? ""}`}>
      <div className={`flex w-full items-center-safe justify-between gap-8 bg-input-bg ${selectedOption ? "pl-3 pr-4" : "px-4"} py-2 text-black font-medium cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""} ${rounded ? "rounded-full" : "rounded-medium"}`}
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
        <span className="flex items-center-safe gap-2">
          {selectedOption && (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className="flex animate-fade-in"
            >
              <Icon name="x" color={Colors.InputIcon} className="cursor-pointer" />
            </button>
          )}

          <span className={`font-medium ${selectedOption ? "" : "text-input-text"} select-none`}>
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>

        </span>
        <Icon className={`transition-transform ${open ? "rotate-180" : ""}`} name="chevronDown" color={Colors.InputIcon} />
      </div>

      {open && (<MenuList className="absolute z-10 mt-1 w-full" role="listbox" aria-label={name}>
          {options.map((option, index) => {
            const isSelected = getOptionValue(option) === selectedValue;

            return (
              <MenuItem key={index} role="option" selected={isSelected}
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
