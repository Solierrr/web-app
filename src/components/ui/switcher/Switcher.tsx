import type { RedirectOption } from "@/shared/types/navigation/navigation" 
import { Link } from "react-router-dom";

interface SwitcherProps {
    options: RedirectOption[];
}

export default function Switcher({ options }: SwitcherProps) {
    return (
        <div className="aspect-button-orange shadow-medium-orange py-2 px-4">
            { options.map((option) => (
                <Link to={option.url}>{option.content}</Link>
            ))}
        </div>
    );
}