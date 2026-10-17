import type { ComponentProps } from "react";

/** Place cards with col-span/row-span utilities; data and ordering belong to the consumer. */
export default function Dashboard({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-6 xl:grid-cols-12 ${className}`} />;
}
