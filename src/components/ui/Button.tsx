import Colors from "@/domain/enum/colors"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    content:     string;
    txtColor?:  Colors;
    bgColor?:    Colors;
    title?:      string;
    description: string;
    rounded?:    boolean;

    className?: string;
}

export function Button({ content, title, description, rounded = false, bgColor = Colors.Orange, txtColor = Colors.White, className, ...props}: ButtonProps) {
    return (
        <button className={`px-4 py-2 medium cursor-pointer select-none ${rounded ? "rounded-full" : "rounded-lg"} ${className ?? ""}`}
        {...props} title={title} aria-label={description} style={{backgroundColor: bgColor, color: txtColor}}>
        {content}
        </button>
    )
}