import { useState } from "react";

import Colors from "@/lib/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { InvalidPropError } from "@/features/error/invalid-prop/InvalidProp.error";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import sleep from "@/lib/utils/sleep.utils";

const MOCKED_ACTION_DELAY_MS = 2000;

// Classes escritas por extenso (não interpoladas) para o Tailwind conseguir
// gerar `aspect-button-*`/`shadow-medium-*` em build — ver uso análogo em
// `Switcher.tsx`. Só cobre as cores usadas com fundo sólido (texto branco);
// `bgColor`s claros (ex.: `Colors.WHITE`) não usam o relevo do `aspect-button-*`.
const ASPECT_BUTTON_CLASSES: Partial<Record<Colors, string>> = {
  [Colors.ORANGE]: "aspect-button-orange",
  [Colors.BLACK]: "aspect-button-black shadow-medium-black",
};

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
  variant?: "advanced" | "flat" | "soft" | "surface";
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
  variant = "flat",
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
  const soft = variant === "soft" || variant === "surface";
  const inverse = icon?.inverse ?? false;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!action) return;

    const mocksActive = isAlwaysMockMode();

    setIsLoading(true);
    try {
      await Promise.all([action(), ...(mocksActive ? [sleep(MOCKED_ACTION_DELAY_MS)] : [])]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className={`relative flex items-center-safe justify-center font-medium cursor-pointer text-nowrap disabled:cursor-not-allowed select-none transition-all duration-350 enabled:hover:brightness-95 enabled:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-operational-ink disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 ${soft || rounded || iconOnly ? "rounded-full" : "rounded-medium"} ${iconOnly ? "aspect-square p-2" : soft ? "px-7 py-3" : "px-4 py-2"} ${soft ? (variant === "surface" ? "button-soft button-soft-surface" : bgColor === Colors.WHITE ? "button-soft button-soft-neutral" : "button-soft") : variant === "advanced" ? (ASPECT_BUTTON_CLASSES[bgColor] ?? "") : bgColor === Colors.ORANGE ? "button-flat-orange" : ""} ${className ?? ""}`}
      {...props}
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={title}
      aria-label={description}
      aria-busy={isLoading}
      style={
        { backgroundColor: bgColor, color: txtColor, "--button-accent": bgColor === Colors.WHITE ? Colors.GRAY : bgColor } as React.CSSProperties
      }>
      <span
        className={`flex items-center-safe font-medium justify-center gap-2 ${inverse ? "flex-row" : "flex-row-reverse"} ${isLoading ? "invisible" : ""}`}
        style={{ color: txtColor }}>
        {icon && <Icon name={icon.name} color={txtColor} />}
        {content && <span className={`${soft ? "font-semi-bold " : ""}text-inherit`}>{content}</span>}
      </span>

      {isLoading && (
        <span className="absolute inset-0 font-medium flex items-center justify-center" style={{ color: txtColor }}>
          <Icon name="loader" color={txtColor} className="animate-spin" />
        </span>
      )}
    </button>
  );
}
