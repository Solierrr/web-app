import { useTranslation } from "react-i18next";
import MorphingHexagon from "@@/ui/morphing-hexagon/MorphingHexagon";

interface LogoLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}

export default function LogoLoader({ label, size = 8, className }: LogoLoaderProps) {
  const { t } = useTranslation("commons");
  return (
    <div role="status" aria-label={label ?? t("status.loading")} className={`flex w-full flex-1 items-center justify-center p-8 ${className ?? ""}`}>
      <span
        aria-hidden="true"
        data-testid="logo-loader-mark"
        className="pointer-events-none block aspect-square max-w-full shrink-0 select-none"
        style={{ width: `${size}rem` }}>
        <MorphingHexagon className="size-full" />
      </span>
    </div>
  );
}
