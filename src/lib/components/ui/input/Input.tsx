import { useEffect, useRef, useState } from "react";
import Colors from "@/lib/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";

interface InputIconProps {
  name: IconName;
  label?: string;
  inverse?: boolean;
  onClick?: () => void;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  placeholder?: string;
  rounded?: boolean;
  icon?: InputIconProps;
  suffix?: string;

  className?: string;
}

/**
 * Input text
 *
 * @param props - Propriedades do componente.
 * @param props.name - Nome e rótulo acessível do campo.
 * @param props.placeholder - Texto exibido quando o campo está vazio.
 * @param props.rounded - Define se o campo terá bordas completamente arredondadas.
 * @param props.icon - Configuração opcional do ícone.
 *
 * @param props.icon.name - Nome do ícone.
 * @param props.icon.inverse - Define se o ícone deve utilizar o modo invertido.
 *
 * @returns O componente de input renderizado.
 */
export default function Input({ name, placeholder, icon, suffix, rounded = false, className, value, defaultValue, onChange, ...props }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const visibleValue = String(value ?? uncontrolledValue);
  useEffect(() => {
    const input = ref.current;
    const form = input?.form;
    if (!suffix || value !== undefined || !form) return;
    let active = true;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (active && !event.defaultPrevented) setUncontrolledValue(input?.value ?? "");
      });
    }
    form.addEventListener("reset", reset);
    return () => {
      active = false;
      form.removeEventListener("reset", reset);
    };
  }, [value, suffix]);
  const inverse = icon ? (icon.inverse ?? false) : undefined;

  const iconElement =
    icon &&
    (icon.onClick ? (
      <button type="button" aria-label={icon.label ?? name} onClick={icon.onClick} className={`flex cursor-pointer ${inverse ? "ml-2" : "mr-4"}`}>
        {" "}
        <Icon name={icon.name} color={Colors.INPUTICON} />{" "}
      </button>
    ) : (
      <Icon className={`${inverse ? "ml-2" : "mr-4"}`} name={icon.name} color={Colors.INPUTICON} />
    ));

  const inputElement = (
    <input
      ref={ref}
      className={`${suffix ? "absolute inset-0 px-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : inverse === undefined ? "px-4" : inverse ? "pr-4 pl-2" : "pr-2 pl-4"} min-w-0 bg-transparent py-2 text-black font-medium placeholder:text-input-text w-full placeholder:select-none caret-orange caret focus:outline-0 cursor-text read-only:cursor-default disabled:cursor-not-allowed medium`}
      {...props}
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        if (suffix && value === undefined) setUncontrolledValue(event.target.value);
        onChange?.(event);
      }}
      placeholder={placeholder}
      aria-label={props["aria-label"] ?? name}
      name={name}
    />
  );

  const field = suffix ? (
    <div className={`flex min-w-0 flex-1 items-center gap-1 px-4 ${props.disabled ? "cursor-not-allowed" : props.readOnly ? "cursor-default" : "cursor-text"}`} onClick={() => ref.current?.focus()}>
      <span className="relative min-w-0">
        <span aria-hidden="true" className="invisible block overflow-hidden whitespace-pre py-2 text-body font-medium">
          {visibleValue || placeholder || " "}
        </span>
        {inputElement}
      </span>
      <span aria-hidden="true" className={`shrink-0 text-body ${visibleValue ? "text-black" : "text-input-text"}`}>
        {suffix}
      </span>
    </div>
  ) : (
    inputElement
  );

  return (
    <div className={`flex w-fit bg-input-bg ${rounded ? "rounded-full" : "rounded-medium"} flex-row items-center-safe ${className ?? ""}`}>
      {inverse ? (
        <>
          {iconElement}
          {field}
        </>
      ) : (
        <>
          {field}
          {iconElement}
        </>
      )}
    </div>
  );
}
