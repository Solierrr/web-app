import { Link, useLocation } from "react-router-dom";
import { HyperlinkUrlType } from "./Hyperlink.enum";

interface HyperlinkProps {
    content: string;
    url: string;
    type?: HyperlinkUrlType;

    className?: string;
}

export function Hyperlink({ content, url, type = HyperlinkUrlType.COMPLETE, className }: HyperlinkProps) {
    const { pathname } = useLocation();

    let redirect: string;
    if (type === HyperlinkUrlType.COMPLETE) { redirect = url; }
    else if (type === HyperlinkUrlType.CONCAT) { redirect = `${pathname}/${url}`; }
    else { throw new Error(); }

    return (
        <div className="flex w-fit px-1 bg-interactive rounded-small">
            <Link className={`font-medium ${className}`} to={redirect}>{content}</Link>
        </div>
    );
}