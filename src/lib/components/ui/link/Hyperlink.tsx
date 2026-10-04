import { Link, useLocation } from "react-router-dom";
import { HyperlinkUrlType } from "./Hyperlink.enum";

interface HyperlinkProps {
  content: string;
  url: string;
  type?: HyperlinkUrlType;

  className?: string;
  state?: unknown;
}

export default function Hyperlink({ content, url, type = HyperlinkUrlType.COMPLETE, className = "", state }: HyperlinkProps) {
  const { pathname } = useLocation();

  let redirect: string;
  if (type === HyperlinkUrlType.COMPLETE) {
    redirect = url;
  } else if (type === HyperlinkUrlType.CONCAT) {
    redirect = `${pathname}/${url}`;
  } else {
    throw new Error();
  }

  return (
    <div className="flex w-fit px-1 rounded-small bg-black/0 hover:bg-black/2 transition-colors duration-800">
      <Link className={`font-medium hover:text-orange transition-colors duration-200 ${className}`} to={redirect} state={state}>
        {content}
      </Link>
    </div>
  );
}
