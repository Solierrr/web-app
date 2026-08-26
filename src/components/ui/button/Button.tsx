import Colors from "@/domain/enum/colors"
import Icon, { type IconName } from "@@/ui/icon/Icon"
import { InvalidPropError } from "@/domain/errors/InvalidPropError"

interface ButtonIconProps {
    name:     IconName;
    inverse?: boolean;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    content?:    string;
    icon?:       ButtonIconProps;
    txtColor?:   Colors;
    bgColor?:    Colors;
    title?:      string;
    description: string;
    rounded?:    boolean;
    disabled?:   boolean;

    className?: string;
}

export default function Button({ content, icon, title, description, rounded = false, disabled = false, bgColor = Colors.Orange, txtColor = Colors.White, className, ...props}: ButtonProps) {
    if (!content && !icon) { throw InvalidPropError.missingProps("Button", ["content", "icon"]); }

    const iconOnly = !content;
    const inverse = icon?.inverse ?? false;

    return (
        <button className={`flex items-center-safe justify-center gap-2 font-medium cursor-pointer disabled:cursor-not-allowed select-none ${inverse ? "flex-row" : "flex-row-reverse"} ${iconOnly ? "aspect-square rounded-full p-2" : `px-4 py-2 ${rounded ? "rounded-full" : "rounded-medium"}`} ${className ?? ""}`}
        {...props} disabled={disabled} title={title} aria-label={description} style={{backgroundColor: bgColor, color: txtColor}}>
        {icon && <Icon name={icon.name} color={txtColor} />}
        {content}
        </button>
    )
}
