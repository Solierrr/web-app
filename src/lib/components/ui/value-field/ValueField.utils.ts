import type { ValueComparison, ValueReference } from "./ValueField.d";

export function valueReference(values: (number | null | undefined)[]): ValueReference | undefined {
  const valid = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!valid.length) return undefined;
  return {
    min: valid.reduce((min, value) => Math.min(min, value), Infinity),
    max: valid.reduce((max, value) => Math.max(max, value), -Infinity),
    mean: valid.reduce((sum, value) => sum + value / valid.length, 0),
    count: valid.length,
  };
}

export function compareValue(value: number | null | undefined, reference?: ValueReference, precision = 3): ValueComparison | undefined {
  if (value == null || !Number.isFinite(value) || !reference || reference.count < 2) return undefined;
  const difference = Number((value - reference.mean).toFixed(precision));
  return {
    difference,
    direction: difference > 0 ? "above" : difference < 0 ? "below" : "near",
    position: reference.max > reference.min ? Math.min(1, Math.max(0, (value - reference.min) / (reference.max - reference.min))) : 0.5,
  };
}
