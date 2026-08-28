import Colors from "@/shared/styles/colors/colors.enum";
import Icon, { type IconName } from "@@/ui/icon/Icon";
import { InvalidPropError } from "@/config/error/InvalidProp.error";

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

  className?: string;
}

export default function Button({
  content,
  icon,
  title,
  description,
  rounded = false,
  disabled = false,
  bgColor = Colors.Orange,
  txtColor = Colors.White,
  className,
  ...props
}: ButtonProps) {
  if (!content && !icon) {
    throw InvalidPropError.missingProps("Button", ["content", "icon"]);
  }

  const iconOnly = !content;
  const inverse = icon?.inverse ?? false;

  return (
    <button
      className={`flex items-center-safe justify-center gap-2 font-medium cursor-pointer text-nowrap disabled:cursor-not-allowed select-none transition-all duration-350 ${inverse ? "flex-row" : "flex-row-reverse"} ${iconOnly ? `aspect-square ${rounded ? "rounded-full" : "rounded-medium"} p-2` : `px-4 py-2 ${rounded ? "rounded-full" : "rounded-medium"}`} ${className ?? ""}`}
      {...props}
      disabled={disabled}
      title={title}
      aria-label={description}
      style={{ backgroundColor: bgColor, color: txtColor }}
    >
      {icon && <Icon name={icon.name} color={txtColor} />}
      {content}
    </button>
  );
}
