import type { ReactNode } from "react";

export interface ValueReference {
  min: number;
  max: number;
  mean: number;
  count: number;
}

export interface ValueComparison {
  direction: "above" | "below" | "near";
  position: number;
  difference: number;
}

export interface ValueFieldProps {
  children: ReactNode;
  meter?: { value: number; min: number; max: number; label: string };
  comparison?: ValueComparison & {
    label: string;
    representation?: "direction" | "range";
    favorable?: boolean;
  };
}
