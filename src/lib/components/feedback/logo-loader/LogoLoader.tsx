import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

interface LogoLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}

const MASK = "url(/snowflake.svg) center / contain no-repeat";
const TIMING = { "--shimmer-duration": 2200, "--shimmer-repeat-delay": 500 } as CSSProperties;

export default function LogoLoader({ label, size = 4, className }: LogoLoaderProps) {
  const { t } = useTranslation("commons");
  return (
    <div role="status" aria-label={label ?? t("status.loading")} className={`flex w-full flex-1 items-center justify-center p-8 ${className ?? ""}`}>
      <span
        aria-hidden="true"
        data-testid="logo-loader-mark"
        className="shimmer shimmer-bg shimmer-color-orange shimmer-spread-100 pointer-events-none block aspect-square select-none bg-orange/15"
        style={{ width: `${size}rem`, mask: MASK, WebkitMask: MASK, ...TIMING }}
      />
    </div>
  );
}
