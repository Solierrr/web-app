import { useEffect, useRef } from "react";
import { drawCanvas, type CanvasScene, type CanvasVariant } from "./Canvas.utils";
import { createGridRenderer, GRID_CELL_SIZE } from "./Grid.utils";

export default function Canvas({ variant }: { variant: CanvasVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
      surface: colors.getPropertyValue("--color-white").trim() || "#FFFFFF",
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
      const changedCell =
        !scene.pointer.active ||
        Math.floor(event.offsetX / GRID_CELL_SIZE) !== Math.floor(scene.pointer.x / GRID_CELL_SIZE) ||
        Math.floor(event.offsetY / GRID_CELL_SIZE) !== Math.floor(scene.pointer.y / GRID_CELL_SIZE);
      scene.pointer = { x: event.offsetX, y: event.offsetY, active: true };
      if (variant !== "grid" || changedCell) wake();
    }
    function leave() {
      scene.pointer.active = false;
      wake();
    }
    function pulse(event: PointerEvent) {
      if (motion.matches) return;
      move(event);
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
      update();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", pulse);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", preferenceChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", pulse);
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", preferenceChanged);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 size-full"
      style={{ maskImage: "linear-gradient(to right, transparent, black 20%)" }}
    />
  );
}
