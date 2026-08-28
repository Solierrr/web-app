import type { SkeletonProps } from "./Skeleton.d";

export default function Skeleton({
  width = "100%",
  height = "100%",
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className ?? ""}`}
      style={{
        width,
        height,
        maxWidth: "100%",
        maxHeight: "100%",
        ...style,
      }}
      {...props}
    />
  );
}
