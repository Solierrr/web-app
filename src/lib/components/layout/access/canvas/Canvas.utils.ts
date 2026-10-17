export type CanvasVariant = "dots" | "grid" | "waves";

export interface CanvasScene {
  width: number;
  height: number;
  time: number;
  pointer: { x: number; y: number; active: boolean };
  ripple: { x: number; y: number; time: number } | null;
  ripples: { x: number; y: number; time: number }[];
  orange: string;
  neutral: string;
  surface: string;
}

export function drawCanvas(ctx: CanvasRenderingContext2D, variant: CanvasVariant, scene: CanvasScene) {
  const { width, height, time, pointer, orange, neutral, surface } = scene;
  ctx.globalAlpha = 1;
  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, width, height);
  const centerX = width * 0.52;
  const centerY = height * 0.48;
  const radius = Math.min(width, height) * 0.28;
  const influence = (x: number, y: number) => (pointer.active ? Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 150) : 0);

  if (variant === "dots") {
    const gap = 15;
    for (let x = gap / 2; x < width; x += gap) {
      for (let y = gap / 2; y < height; y += gap) {
        const distance = Math.hypot(x - centerX, y - centerY);
        const ring = Math.exp(-Math.pow((distance - radius) / (radius * 0.3), 2));
        const heat = influence(x, y);
        const drift = Math.sin(time * 0.5 + distance * 0.015) * ring * 2;
        ctx.fillStyle = ring > 0.25 || heat > 0.1 ? orange : neutral;
        ctx.globalAlpha = Math.min(0.9, 0.12 + ring * 0.58 + heat * 0.5);
        ctx.beginPath();
        ctx.arc(x + drift, y + drift, 0.8 + ring * 0.65 + heat * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    const lines = 42;
    for (let line = 0; line < lines; line++) {
      const ratio = line / (lines - 1);
      ctx.strokeStyle = orange;
      ctx.globalAlpha = 0.12 + Math.sin(ratio * Math.PI) * 0.28;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let x = -20; x <= width + 20; x += 8) {
        const envelope = Math.sin(Math.max(0, Math.min(1, x / width)) * Math.PI);
        const baseY = centerY + (ratio - 0.5) * height * 0.65;
        const wave = Math.sin((x / width) * 7 + ratio * 3 + time * 0.35) * envelope * radius * 0.42;
        const bend = influence(x, baseY) * Math.sin(ratio * Math.PI) * 45;
        const y = baseY + wave + bend;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (scene.ripple && variant !== "grid") {
    const age = time - scene.ripple.time;
    if (age >= 0 && age < 1.5) {
      ctx.strokeStyle = orange;
      ctx.globalAlpha = (1 - age / 1.5) * 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(scene.ripple.x, scene.ripple.y, 8 + age * 100, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
