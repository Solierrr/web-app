import type { CanvasScene } from "./Canvas.utils";

export const GRID_CELL_SIZE = 46;
const GAP = GRID_CELL_SIZE;
const REACH = GAP * 4;

export function createGridRenderer(ctx: CanvasRenderingContext2D) {
  let width = -1;
  let height = -1;
  const base = document.createElement("canvas");
  const cells: { path: Path2D; x: number; y: number }[] = [];
  const fading = new Map<number, number>();
  let waves: { start: number; cells: { index: number; delay: number; strength: number }[] }[] = [];
  const colors = new Map<number, number>();
  const dirty = new Set<number>();
  const dirtyRows = new Map<number, { first: number; last: number }>();
  const offsets: { column: number; row: number; delay: number; strength: number }[] = [];
  for (let row = -4; row <= 4; row++) {
    for (let column = -4; column <= 4; column++) {
      const distance = Math.hypot(column * GAP, row * GAP);
      if (distance <= REACH) offsets.push({ column, row, delay: distance / 220, strength: 1 - distance / (REACH + GAP) });
    }
  }
  let previousTime = 0;

  function rebuild(scene: CanvasScene) {
    width = scene.width;
    height = scene.height;
    base.width = ctx.canvas.width;
    base.height = ctx.canvas.height;
    const backdrop = base.getContext("2d");
    if (!backdrop) return;
    backdrop.setTransform(ctx.getTransform());
    backdrop.fillStyle = scene.surface;
    backdrop.fillRect(0, 0, width, height);
    backdrop.strokeStyle = scene.neutral;
    backdrop.globalAlpha = 0.12;
    backdrop.lineWidth = 0.7;
    backdrop.beginPath();
    for (let x = 0; x <= width; x += GAP) {
      backdrop.moveTo(x, 0);
      backdrop.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += GAP) {
      backdrop.moveTo(0, y);
      backdrop.lineTo(width, y);
    }
    backdrop.stroke();
    cells.length = 0;
    fading.clear();
    waves = [];
    dirty.clear();
    for (let y = 0; y < height; y += GAP) {
      for (let x = 0; x < width; x += GAP) {
        const path = new Path2D();
        path.roundRect(x + 4, y + 4, GAP - 8, GAP - 8, 5);
        cells.push({ path, x: x + GAP / 2, y: y + GAP / 2 });
        backdrop.fillStyle = scene.neutral;
        backdrop.globalAlpha = 0.2;
        backdrop.fillRect(x - 1, y - 1, 2, 2);
      }
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0);
    ctx.restore();
  }

  return (scene: CanvasScene) => {
    if (width !== scene.width || height !== scene.height || base.width !== ctx.canvas.width || base.height !== ctx.canvas.height) rebuild(scene);
    const delta = Math.min(0.05, Math.max(0, scene.time - previousTime));
    previousTime = scene.time;
    const columns = Math.ceil(width / GAP);
    if (!scene.ripple && !scene.ripples.length) waves = [];
    const hovered = scene.pointer.active ? Math.floor(scene.pointer.y / GAP) * columns + Math.floor(scene.pointer.x / GAP) : -1;
    if (hovered >= 0 && hovered < cells.length && !fading.has(hovered)) fading.set(hovered, 0);
    for (const ripple of scene.ripples.splice(0)) {
      const column = Math.floor(ripple.x / GAP);
      const row = Math.floor(ripple.y / GAP);
      const affected: { index: number; delay: number; strength: number }[] = [];
      for (const offset of offsets) {
        const targetColumn = column + offset.column;
        const targetRow = row + offset.row;
        if (targetColumn >= 0 && targetColumn < columns && targetRow >= 0 && targetRow < Math.ceil(height / GAP)) {
          affected.push({ index: targetRow * columns + targetColumn, delay: offset.delay, strength: offset.strength });
        }
      }
      waves.push({ start: ripple.time, cells: affected });
    }
    ctx.globalAlpha = 1;
    const dpr = ctx.getTransform().a;
    dirtyRows.clear();
    for (const index of dirty) {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const range = dirtyRows.get(row);
      if (range) {
        range.first = Math.min(range.first, column);
        range.last = Math.max(range.last, column);
      } else dirtyRows.set(row, { first: column, last: column });
    }
    for (const [row, range] of dirtyRows) {
      const x = range.first * GAP;
      const y = row * GAP;
      const cellWidth = Math.min((range.last - range.first + 1) * GAP, width - x);
      const cellHeight = Math.min(GAP, height - y);
      ctx.drawImage(base, x * dpr, y * dpr, cellWidth * dpr, cellHeight * dpr, x, y, cellWidth, cellHeight);
    }
    dirty.clear();
    colors.clear();
    let animating = false;
    for (const [index, alpha] of fading) {
      const target = index === hovered ? 0.45 : 0;
      const duration = target ? 0.075 : 0.16;
      const next = alpha + (target - alpha) * (1 - Math.exp(-delta / duration));
      const settled = Math.abs(target - next) < 0.002;
      const value = settled ? target : next;
      if (!settled) animating = true;
      if (!value && settled) {
        fading.delete(index);
        continue;
      }
      fading.set(index, value);
      colors.set(index, value);
    }
    waves = waves.filter((wave) => scene.time - wave.start < REACH / 220 + 0.65);
    for (const wave of waves) {
      const elapsed = scene.time - wave.start;
      for (const cell of wave.cells) {
        const age = elapsed - cell.delay;
        if (age < 0.65) animating = true;
        if (age >= 0 && age < 0.65) {
          const alpha = Math.sin((age / 0.65) * Math.PI) * cell.strength * 0.65;
          const existing = colors.get(cell.index) ?? 0;
          colors.set(cell.index, 1 - (1 - existing) * (1 - alpha));
        }
      }
    }
    ctx.fillStyle = scene.orange;
    for (const [index, alpha] of colors) {
      if (alpha < 0.001) continue;
      ctx.globalAlpha = Math.min(0.8, alpha);
      ctx.fill(cells[index].path);
      dirty.add(index);
    }
    ctx.globalAlpha = 1;
    return animating;
  };
}
