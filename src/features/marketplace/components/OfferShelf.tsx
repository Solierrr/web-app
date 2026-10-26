import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";

export default function OfferShelf({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation("marketplace", { keyPrefix: "feed" });
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  function measure() {
    const element = track.current;
    if (!element) return;
    setEdges({
      start: element.scrollLeft > 4,
      end: element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    });
  }

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, []);

  function scroll(direction: 1 | -1) {
    const element = track.current;
    element?.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-subtitle font-semi-bold leading-tight tracking-tight">{title}</h2>
        {(edges.start || edges.end) && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <ToolbarAction icon="chevronLeft" label={t("previous")} disabled={!edges.start} onClick={() => scroll(-1)} backgroundColor="var(--color-operational-surface)" className="rounded-full!" />
            <ToolbarAction icon="chevronRight" label={t("next")} disabled={!edges.end} onClick={() => scroll(1)} backgroundColor="var(--color-operational-surface)" className="rounded-full!" />
          </div>
        )}
      </div>
      <div className="relative min-w-0">
        <div ref={track} onScroll={measure} className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2">
          {children}
        </div>
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-operational-shell to-transparent transition-opacity duration-300 ${edges.start ? "opacity-100" : "opacity-0"}`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-operational-shell to-transparent transition-opacity duration-300 ${edges.end ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </section>
  );
}
