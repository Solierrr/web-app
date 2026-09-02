import type { SkeletonProps } from "./Skeleton.d";

export default function Skeleton({ width = "100%", height = "100%", className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-skeleton shimmer shimmer-bg shimmer-color-skeleton-highlight select-none pointer-events-none ${className ?? ""}`}
      aria-hidden="true"
      style={{ width, height, maxWidth: "100%", maxHeight: "100%", ...style, }}
      {...props}
    />
  );
}
