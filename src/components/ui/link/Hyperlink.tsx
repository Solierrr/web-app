import { Link, useLocation } from "react-router-dom";
import { HyperlinkUrlType } from "./Hyperlink.enum";

interface HyperlinkProps {
  content: string;
  url: string;
  type?: HyperlinkUrlType;

  className?: string;
  state?: unknown;
}

export default function Hyperlink({ content, url, type = HyperlinkUrlType.COMPLETE, className, state }: HyperlinkProps) {
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
    <div className="flex w-fit px-2 rounded-small bg-interactive">
      <Link className={`font-medium ${className} hover:text-orange transition-colors duration-400`} to={redirect} state={state}>
        {content}
      </Link>
    </div>
  );
}
