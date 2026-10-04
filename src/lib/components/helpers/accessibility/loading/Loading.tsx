import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LoadingProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export default function Loading({ children, label, className }: LoadingProps) {
  const { t } = useTranslation("commons");
  return (
    <div
      role="status"
      aria-label={label ?? t("status.loading")}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${className ?? ""}`}>
      <div aria-hidden="true" className="pointer-events-none select-none grayscale opacity-60 motion-safe:animate-pulse">
        {children}
      </div>
    </div>
  );
}
