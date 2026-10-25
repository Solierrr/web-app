import { useState } from "react";
import Icon, { type IconName } from "@@/ui/icon/Icon";

export default function MarketplaceImage({
  src,
  alt,
  className = "",
  contain = false,
  fallback = "building",
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  contain?: boolean;
  fallback?: IconName;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string>();
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-operational-surface ${className}`}>
      {src && failed !== src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(src)}
          className={`h-full w-full transition-transform duration-250 group-hover:scale-105 motion-reduce:transform-none ${contain ? "object-contain p-6 mix-blend-multiply" : "object-cover"}`}
        />
      ) : (
        <Icon name={fallback} size={48} className="text-orange/60" />
      )}
    </div>
  );
}
