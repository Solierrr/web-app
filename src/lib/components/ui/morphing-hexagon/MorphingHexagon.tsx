import { useEffect, useId, useRef } from "react";
import { framePoints, HOLD_MS, MORPH_MS, ROTATION_PER_MS, toPath } from "./morphingHexagon.utils";
import Icon, { type IconName } from "../icon/Icon";

/**
 * Brand hexagon that continuously morphs between rounded polygons (6 → 7 → 8 → 4 → 5 → 6…),
 * Material-style: corners recede into the edge and new ones emerge, driven by a spring.
 */
export default function MorphingHexagon({
  paused = false,
  className,
  icon,
  rotateSymbol = true,
  rotateShape,
  motion = "expressive",
  holdMs,
  transitionMs,
  advance = 0,
}: {
  paused?: boolean;
  className?: string;
  icon?: IconName;
  rotateSymbol?: boolean;
  rotateShape?: boolean;
  motion?: "expressive" | "subtle";
  holdMs?: number;
  transitionMs?: number;
  advance?: number;
}) {
  const id = useId().replace(/:/g, "");
  const initialPath = toPath(framePoints(0, motion, { holdMs, transitionMs, rotateShape }));
  const shape = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const highlight = useRef<SVGPathElement>(null);
  const mark = useRef<SVGGElement>(null);
  const elapsed = useRef(0);
  const offset = useRef(0);
  const lastAdvance = useRef(advance);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (lastAdvance.current !== advance) {
      const hold = Math.max(0, holdMs ?? (motion === "subtle" ? 5000 : HOLD_MS));
      const duration = Math.max(1, transitionMs ?? (motion === "subtle" ? 500 : MORPH_MS));
      const local = (elapsed.current + offset.current) % (hold + duration);
      if (reduced.matches || paused) offset.current += hold + duration - local;
      else if (local < hold) offset.current += hold - local;
      lastAdvance.current = advance;
    }
    const draw = () => {
      const d = toPath(
        framePoints(elapsed.current + offset.current, motion, { holdMs, transitionMs, rotateShape, rotationElapsed: elapsed.current }),
      );
      shape.current?.setAttribute("d", d);
      clip.current?.setAttribute("d", d);
      highlight.current?.setAttribute("d", d);
      mark.current?.setAttribute(
        "transform",
        `rotate(${rotateSymbol && motion !== "subtle" ? (elapsed.current * ROTATION_PER_MS * 180) / Math.PI : 0} 50 50)`,
      );
    };
    draw();
    if (paused || reduced.matches) return;

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!document.hidden) elapsed.current += Math.max(0, Math.min(now - last, 100));
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, rotateSymbol, rotateShape, motion, holdMs, transitionMs, advance]);

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1="50" y1="8" x2="50" y2="92">
          <stop stopColor="#F57D2D" />
          <stop offset="1" stopColor="#E85900" />
        </linearGradient>
        <radialGradient id={`${id}-light`} gradientUnits="userSpaceOnUse" cx="34" cy="20" r="68">
          <stop stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.1" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path ref={clip} d={initialPath} />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path ref={shape} d={initialPath} fill={`url(#${id}-fill)`} />
      </g>
      <g clipPath={`url(#${id}-clip)`}>
        <path ref={highlight} d={initialPath} fill={`url(#${id}-light)`} />
        <g ref={mark}>
          {icon ? (
            <svg x="32" y="32" width="36" height="36" viewBox="0 0 24 24">
              <Icon name={icon} color="#fff" strokeWidth={1.7} />
            </svg>
          ) : (
            <svg x="24" y="29.9" width="52" height="43.33" viewBox="0 0 150 125">
              <use href="/branding/hands.svg#hands-mark" />
            </svg>
          )}
        </g>
      </g>
    </svg>
  );
}
