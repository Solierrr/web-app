import { useEffect, useId, useRef } from "react";
import { framePoints, toPath } from "./morphingHexagon.utils";

/**
 * Brand hexagon that continuously morphs between rounded polygons (6 → 7 → 8 → 4 → 5 → 6…),
 * Material-style: corners recede into the edge and new ones emerge, driven by a spring.
 */
export default function MorphingHexagon({ paused = false, className }: { paused?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const shape = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const highlight = useRef<SVGPathElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const draw = () => {
      const d = toPath(framePoints(elapsed.current));
      shape.current?.setAttribute("d", d);
      clip.current?.setAttribute("d", d);
      highlight.current?.setAttribute("d", d);
    };
    draw();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  }, [paused]);

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1="50" y1="8" x2="50" y2="92">
          <stop stopColor="#F57D2D" />
          <stop offset="1" stopColor="#E85900" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.1" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path ref={clip} />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path ref={shape} fill={`url(#${id}-fill)`} />
      </g>
      <g clipPath={`url(#${id}-clip)`}>
        <path ref={highlight} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="7" style={{ filter: "blur(2.5px)" }} />
      </g>
    </svg>
  );
}
