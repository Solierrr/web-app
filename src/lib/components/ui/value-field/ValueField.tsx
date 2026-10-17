import Icon from "@@/ui/icon/Icon";
import type { ValueFieldProps } from "./ValueField.d";

export default function ValueField({ children, meter, comparison }: ValueFieldProps) {
  const strength = meter && meter.max > meter.min ? (meter.value - meter.min) / (meter.max - meter.min) : 0.5;
  const directionColor = comparison?.favorable
    ? "text-feedback-success"
    : comparison?.direction === "near"
      ? "text-operational-muted"
      : "text-orange";
  return (
    <span
      aria-label={comparison?.label}
      className="inline-flex max-w-full items-center gap-3 rounded-medium bg-white px-3 py-2 text-body font-medium text-operational-ink">
      <span className="text-inherit tabular-nums">{children}</span>
      {comparison && (
        <span aria-hidden="true" className={`inline-flex h-4 w-5 shrink-0 items-center justify-center ${directionColor}`}>
          {comparison.representation === "range" ? (
            <span className="relative h-1 w-5 rounded-full bg-orange/20">
              <span
                className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange"
                style={{ left: `${comparison.position * 100}%` }}
              />
            </span>
          ) : (
            <Icon
              name={comparison.direction === "near" ? "minus" : "arrowUp"}
              color="currentColor"
              size={16}
              className={`${comparison.direction === "below" ? "rotate-180" : ""} text-inherit [&_*]:text-inherit`}
            />
          )}
        </span>
      )}
      {meter && (
        <span
          role="meter"
          aria-label={meter.label}
          title={meter.label}
          aria-valuemin={meter.min}
          aria-valuemax={meter.max}
          aria-valuenow={meter.value}
          aria-valuetext={typeof children === "string" ? children : undefined}
          className="inline-flex shrink-0 items-end gap-0.5">
          {["h-1.5", "h-2.5", "h-3.5"].map((height, index) => (
            <span key={height} className={`w-1 rounded-small ${height} ${index / 3 <= strength ? "bg-orange" : "bg-input-outline"}`} />
          ))}
        </span>
      )}
    </span>
  );
}
