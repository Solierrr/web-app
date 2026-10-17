export type Point = readonly [number, number];

export const SAMPLES = 72;
export const HOLD_MS = 600;
export const MORPH_MS = 1000;
export const STEP_MS = HOLD_MS + MORPH_MS;

const CENTER = 50;
const TARGET_AREA = Math.PI * 34 * 34;
const INNER_RADIUS = 31;
const ROUNDING = 7;
const ROTATION_PER_MS = (2 * Math.PI) / 18000;
const DAMPING = 0.6;
const NATURAL_FREQUENCY = 12;

function distanceToPolygon(x: number, y: number, vertices: readonly Point[]) {
  let inside = false;
  let nearest = Infinity;
  vertices.forEach(([ax, ay], index) => {
    const [bx, by] = vertices[(index + 1) % vertices.length];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    nearest = Math.min(nearest, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  });
  return inside ? 0 : nearest;
}

type RadialFn = (angle: number) => number;

/** Rounded regular polygon with a vertex at the top (the brand hexagon is the 6-sided one). */
function polygon(sides: number): RadialFn {
  const vertices = Array.from({ length: sides }, (_, index): Point => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / sides;
    return [INNER_RADIUS * Math.cos(angle), INNER_RADIUS * Math.sin(angle)];
  });
  return (angle) => {
    let low = 0;
    let high = INNER_RADIUS + ROUNDING + 1;
    for (let iteration = 0; iteration < 24; iteration++) {
      const middle = (low + high) / 2;
      if (distanceToPolygon(middle * Math.cos(angle), middle * Math.sin(angle), vertices) <= ROUNDING) low = middle;
      else high = middle;
    }
    return low;
  };
}

/** Lobed shape: `lobes` bumps of relative `depth`; `sharpness` > 1 pinches the bumps, < 1 pinches the valleys. */
function lobed(lobes: number, depth: number, sharpness = 1): RadialFn {
  return (angle) => 1 + depth * (2 * Math.pow((1 + Math.cos(lobes * (angle + Math.PI / 2))) / 2, sharpness) - 1);
}

/** Superellipse stretched horizontally; exponent 2 is an ellipse, higher is a squarer pill. */
function stretched(width: number, height: number, exponent: number): RadialFn {
  return (angle) =>
    Math.pow(Math.pow(Math.abs(Math.cos(angle)) / width, exponent) + Math.pow(Math.abs(Math.sin(angle)) / height, exponent), -1 / exponent);
}

/** Cycle of shapes; starts on the brand hexagon and loops back to it. */
const SHAPES: readonly RadialFn[] = [
  polygon(6),
  lobed(4, 0.17),
  lobed(9, 0.07),
  stretched(1, 0.62, 4),
  polygon(5),
  lobed(12, 0.07, 1.3),
  lobed(8, 0.14, 0.7),
];
export const SHAPE_COUNT = SHAPES.length;

const radii = new Map<number, number[]>();

/**
 * Radius of a shape for SAMPLES evenly spaced angles. Every shape is star-shaped around the
 * center, so morphing the radii makes corners recede into the edge while new ones emerge
 * elsewhere. Area is normalized so shapes feel equally big.
 */
export function shapeRadii(index: number): number[] {
  const cached = radii.get(index);
  if (cached) return cached;
  const raw = Array.from({ length: SAMPLES }, (_, sample) => SHAPES[index]((sample * 2 * Math.PI) / SAMPLES));
  const area = raw.reduce((sum, radius) => sum + radius * radius, 0) * (Math.PI / SAMPLES);
  const scale = Math.sqrt(TARGET_AREA / area);
  const normalized = raw.map((radius) => radius * scale);
  radii.set(index, normalized);
  return normalized;
}

/** Underdamped spring step response: 0 → 1 with a slight overshoot. */
export function spring(progress: number) {
  if (progress >= 1) return 1;
  const seconds = progress * (MORPH_MS / 1000);
  const decay = DAMPING * NATURAL_FREQUENCY;
  const damped = NATURAL_FREQUENCY * Math.sqrt(1 - DAMPING * DAMPING);
  return 1 - Math.exp(-decay * seconds) * (Math.cos(damped * seconds) + (decay / damped) * Math.sin(damped * seconds));
}

export function framePoints(elapsed: number): Point[] {
  const step = Math.floor(elapsed / STEP_MS);
  const local = elapsed - step * STEP_MS;
  const from = shapeRadii(step % SHAPE_COUNT);
  const to = shapeRadii((step + 1) % SHAPE_COUNT);
  const progress = local <= HOLD_MS ? 0 : spring((local - HOLD_MS) / MORPH_MS);
  const rotation = elapsed * ROTATION_PER_MS;
  return from.map((start, index): Point => {
    const radius = start + (to[index] - start) * progress;
    const angle = (index * 2 * Math.PI) / SAMPLES + rotation;
    return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];
  });
}

/** Closed Catmull-Rom curve through the points, as cubic Béziers. */
export function toPath(points: readonly Point[]) {
  const count = points.length;
  const format = (value: number) => value.toFixed(2);
  let path = `M${format(points[0][0])} ${format(points[0][1])}`;
  for (let index = 0; index < count; index++) {
    const before = points[(index - 1 + count) % count];
    const start = points[index];
    const end = points[(index + 1) % count];
    const after = points[(index + 2) % count];
    const control1 = [start[0] + (end[0] - before[0]) / 6, start[1] + (end[1] - before[1]) / 6];
    const control2 = [end[0] - (after[0] - start[0]) / 6, end[1] - (after[1] - start[1]) / 6];
    path += `C${format(control1[0])} ${format(control1[1])} ${format(control2[0])} ${format(control2[1])} ${format(end[0])} ${format(end[1])}`;
  }
  return `${path}Z`;
}
