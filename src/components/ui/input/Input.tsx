import Colors from "@/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";

interface InputIconProps {
  name: IconName;
  inverse?: boolean;
  onClick?: () => void;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  placeholder?: string;
  rounded?: boolean;
  icon?: InputIconProps;

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
export default function Input({
  name,
  placeholder,
  icon,
  rounded = false,
  className,
  ...props
}: InputProps) {
  const inverse = icon ? (icon.inverse ?? false) : undefined;

  const iconElement =
    icon &&
    (icon.onClick ? (
      <button
        type="button"
        onClick={icon.onClick}
        className={`flex cursor-pointer ${inverse ? "ml-2" : "mr-4"}`}
      >
        {" "}
        <Icon name={icon.name} color={Colors.InputIcon} />{" "}
      </button>
    ) : (
      <Icon
        className={`${inverse ? "ml-2" : "mr-4"}`}
        name={icon.name}
        color={Colors.InputIcon}
      />
    ));

  const inputElement = (
    <input
      className={`${inverse === undefined ? "px-4" : inverse ? "pr-4 pl-2" : "pr-2 pl-4"} py-2 text-black font-medium placeholder:text-input-text placeholder:select-none caret-orange caret focus:outline-0 medium`}
      {...props}
      placeholder={placeholder}
      aria-label={name}
      name={name}
    />
  );

  return (
    <div
      className={`flex w-fit bg-input-bg ${rounded ? "rounded-full" : "rounded-medium"} flex-row items-center-safe ${className ?? ""}`}
    >
      {inverse ? (
        <>
          {iconElement}
          {inputElement}
        </>
      ) : (
        <>
          {inputElement}
          {iconElement}
        </>
      )}
    </div>
  );
}
