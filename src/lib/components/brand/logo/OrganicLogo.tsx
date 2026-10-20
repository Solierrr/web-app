import MorphingHexagon from "@@/ui/morphing-hexagon/MorphingHexagon";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface OrganicLogoProps {
  width?: number;
  className?: string;
  label?: string;
  decorative?: boolean;
  paused?: boolean;
  motion?: "subtle" | "expressive";
  rotateSymbol?: boolean;
  rotateShape?: boolean;
  holdMs?: number;
  transitionMs?: number;
  interactive?: boolean;
}

export default function OrganicLogo({
  width = 3,
  className = "",
  label = "Solaria",
  decorative = false,
  paused = false,
  motion = "subtle",
  rotateSymbol = false,
  rotateShape = false,
  holdMs = 5000,
  transitionMs = 500,
  interactive = false,
}: OrganicLogoProps) {
  const [advance, setAdvance] = useState(0);
  const { t } = useTranslation("commons");
  const symbol = (
    <MorphingHexagon
      holdMs={holdMs}
      transitionMs={transitionMs}
      paused={paused}
      motion={motion}
      rotateSymbol={rotateSymbol}
      rotateShape={rotateShape}
      advance={advance}
      className="size-full"
    />
  );
  if (interactive)
    return (
      <button
        type="button"
        aria-label={t("logo.changeShape")}
        onClick={() => setAdvance((current) => current + 1)}
        className={`inline-flex aspect-square max-w-full shrink-0 cursor-pointer select-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-operational-ink ${className}`}
        style={{ width: `${width}rem` }}>
        {symbol}
      </button>
    );
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={`inline-flex aspect-square max-w-full shrink-0 select-none ${className}`}
      style={{ width: `${width}rem` }}>
      {symbol}
    </span>
  );
}
