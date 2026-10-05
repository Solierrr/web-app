import { useEffect, useRef, type CSSProperties } from "react";
import { drawCanvas, type CanvasScene, type CanvasVariant } from "./Canvas.utils";
import { createGridRenderer, GRID_CELL_SIZE } from "./Grid.utils";

export default function Canvas({
  variant,
  style,
  backgroundColor = "var(--color-white)",
  interactionScope = "canvas",
}: {
  variant: CanvasVariant;
  style?: CSSProperties;
  backgroundColor?: CSSProperties["backgroundColor"];
  interactionScope?: "canvas" | "page";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const interactionTarget = interactionScope === "page" ? (canvas.closest("main") ?? canvas) : canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw =
      variant === "grid"
        ? createGridRenderer(ctx)
        : (scene: CanvasScene) => {
            drawCanvas(ctx, variant, scene);
            return true;
          };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const colors = getComputedStyle(document.documentElement);
    const scene: CanvasScene = {
      width: 0,
      height: 0,
      time: 0,
      pointer: { x: 0, y: 0, active: false },
      ripple: null,
      ripples: [],
      orange: colors.getPropertyValue("--color-orange").trim() || "#FF6500",
      neutral: colors.getPropertyValue("--color-gray").trim() || "#797979",
      surface: getComputedStyle(canvas).backgroundColor,
    };
    let frame = 0;
    let previous = 0;
    let visible = false;
    let animating = false;

    function wake() {
      if (!frame && visible && !document.hidden && !motion.matches && scene.width && scene.height) {
        previous = performance.now();
        frame = requestAnimationFrame(render);
      }
    }

    function render(timestamp: number) {
      frame = 0;
      if (variant === "grid" || timestamp - previous >= 1000 / 30) {
        scene.time += previous ? Math.min((timestamp - previous) / 1000, 0.1) : 0;
        previous = timestamp;
        animating = draw(scene);
      }
      if (animating && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(render);
    }

    function update() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (scene.width && scene.height) animating = draw(scene);
      if (animating) wake();
    }

    function resize() {
      if (!canvas) return;
      scene.pointer.active = false;
      const rect = canvas.getBoundingClientRect();
      scene.width = rect.width;
      scene.height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      update();
    }

    function move(event: PointerEvent) {
      if (!canvas || motion.matches) return;
      let x = event.offsetX;
      let y = event.offsetY;
      if (interactionScope === "page") {
        const blocked =
          event.target instanceof Element &&
          event.target.closest("table, form, button, a, input, textarea, select, [role='button'], [role='combobox']");
        if (blocked) {
          leave();
          return;
        }
        const bounds = canvas.getBoundingClientRect();
        x = event.clientX - bounds.left;
        y = event.clientY - bounds.top;
        if (x < 0 || y < 0 || x >= bounds.width || y >= bounds.height) {
          leave();
          return;
        }
      }
      const changedCell =
        !scene.pointer.active ||
        Math.floor(x / GRID_CELL_SIZE) !== Math.floor(scene.pointer.x / GRID_CELL_SIZE) ||
        Math.floor(y / GRID_CELL_SIZE) !== Math.floor(scene.pointer.y / GRID_CELL_SIZE);
      scene.pointer = { x, y, active: true };
      if (variant !== "grid" || changedCell) wake();
    }
    function leave() {
      if (!scene.pointer.active) return;
      scene.pointer.active = false;
      wake();
    }
    function pulse(event: PointerEvent) {
      if (motion.matches) return;
      move(event);
      if (!scene.pointer.active) return;
      scene.ripple = { x: scene.pointer.x, y: scene.pointer.y, time: scene.time };
      if (variant === "grid") scene.ripples.push(scene.ripple);
      wake();
    }
    function preferenceChanged() {
      scene.pointer.active = false;
      scene.ripple = null;
      scene.ripples.length = 0;
      update();
    }
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) scene.pointer.active = false;
      update();
    });
    function visibilityChanged() {
      if (document.hidden) scene.pointer.active = false;
      update();
    }
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    interactionTarget.addEventListener("pointermove", move as EventListener);
    interactionTarget.addEventListener("pointerleave", leave as EventListener);
    interactionTarget.addEventListener("pointercancel", leave as EventListener);
    interactionTarget.addEventListener("pointerdown", pulse as EventListener);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", leave, true);
    document.addEventListener("visibilitychange", visibilityChanged);
    motion.addEventListener("change", preferenceChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      interactionTarget.removeEventListener("pointermove", move as EventListener);
      interactionTarget.removeEventListener("pointerleave", leave as EventListener);
      interactionTarget.removeEventListener("pointercancel", leave as EventListener);
      interactionTarget.removeEventListener("pointerdown", pulse as EventListener);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", leave, true);
      document.removeEventListener("visibilitychange", visibilityChanged);
      motion.removeEventListener("change", preferenceChanged);
    };
  }, [variant, backgroundColor, interactionScope]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full"
      style={{ maskImage: "linear-gradient(to right, transparent, black 20%)", ...style, backgroundColor }}
    />
  );
}
