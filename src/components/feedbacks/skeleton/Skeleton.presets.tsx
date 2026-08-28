import type { ComponentProps } from "react";

import Skeleton from "./Skeleton";

type ImageSkeletonProps = ComponentProps<typeof Skeleton>;

export function ImageSkeleton({ className, ...props }: ImageSkeletonProps) {
  return (
    <Skeleton
      height="auto"
      className={`aspect-square rounded-medium ${className ?? ""}`}
      {...props}
    />
  );
}
