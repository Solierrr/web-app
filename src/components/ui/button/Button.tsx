import { useState } from "react";

import Colors from "@/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { InvalidPropError } from "@/config/error/InvalidProp.error";
import MocksMode from "@/config/mocks/mocksMode.enum";
import sleep from "@/utils/sleep.utils";

const MOCKED_ACTION_DELAY_MS = 2000;

interface ButtonIconProps {
  name: IconName;
  inverse?: boolean;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  content?: string;
  icon?: ButtonIconProps;
  txtColor?: Colors;
  bgColor?: Colors;
  title?: string;
  description: string;
  rounded?: boolean;
  disabled?: boolean;
  action?: () => void | Promise<void>;

  className?: string;
}

export default function Button({
  content,
  icon,
  title,
  description,
  rounded = false,
  disabled = false,
  bgColor = Colors.ORANGE,
  txtColor = Colors.WHITE,
  className,
  action,
  onClick,
  ...props
}: ButtonProps) {
  if (!content && !icon) {
    throw InvalidPropError.missingProps("Button", ["content", "icon"]);
  }

  const [isLoading, setIsLoading] = useState(false);

  const iconOnly = !content;
  const inverse = icon?.inverse ?? false;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!action) return;

    const mocksActive = (import.meta.env.VITE_MOCKS as MocksMode) === MocksMode.ALWAYS;

    setIsLoading(true);
    try {
      await Promise.all([action(), ...(mocksActive ? [sleep(MOCKED_ACTION_DELAY_MS)] : [])]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      // `relative` aqui é o que permite o spinner de loading (abaixo) ficar
      // posicionado em cima do conteúdo real sem alterar o tamanho do botão:
      // o conteúdo real continua ocupando espaço (só fica `invisible`), então
      // as dimensões do botão nunca mudam entre os estados idle/loading.
      className={`relative flex items-center-safe justify-center font-medium cursor-pointer text-nowrap disabled:cursor-not-allowed select-none transition-all duration-350 ${rounded ? "rounded-full" : "rounded-medium"} ${iconOnly ? "aspect-square p-2" : `px-4 py-2`} ${className ?? ""}`}
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={title}
      aria-label={description}
      aria-busy={isLoading}
      style={{ backgroundColor: bgColor, color: txtColor }}>
      <span className={`flex items-center-safe justify-center gap-2 ${inverse ? "flex-row" : "flex-row-reverse"} ${isLoading ? "invisible" : ""}`}>
        {icon && <Icon name={icon.name} color={txtColor} />}
        {content}
      </span>

      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon name="loader" color={txtColor} className="animate-spin" />
        </span>
      )}
    </button>
  );
}
