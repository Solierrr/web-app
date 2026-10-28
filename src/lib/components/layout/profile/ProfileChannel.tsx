import { useState, type ReactNode } from "react";
import WrapperLayout from "@/config/WrapperLayout";
import Icon from "@@/ui/icon/Icon";

interface ProfileChannelProps {
  name: string;
  bannerUrl?: string;
  avatarUrl?: string;
  portrait?: boolean;
  subtitle?: string;
  metadata?: ReactNode;
  actions?: ReactNode;
  navigation?: ReactNode;
  operational?: boolean;
  children: ReactNode;
}

/** Shared profile composition; access rules and data fetching belong to the caller. */
export default function ProfileChannel({
  name,
  bannerUrl,
  avatarUrl,
  portrait = false,
  subtitle,
  metadata,
  actions,
  navigation,
  operational = false,
  children,
}: ProfileChannelProps) {
  const [failedBanner, setFailedBanner] = useState<string>();
  const [failedAvatar, setFailedAvatar] = useState<string>();
  const Wrapper = operational ? "main" : WrapperLayout;
  return (
    <Wrapper
      className={
        operational
          ? "mx-auto w-full max-w-operational-page px-4 py-6 sm:px-8 lg:px-10"
          : "max-w-marketplace-page px-5! pb-16 pt-6 sm:px-10! lg:px-18!"
      }>
      <div className={`flex min-w-0 flex-col ${operational ? "gap-6 py-4" : "gap-10 sm:gap-12"}`}>
        <div
          className={`${operational ? "aspect-[6/1] min-h-28 sm:min-h-36" : "h-56 sm:h-72 lg:h-88"} w-full overflow-hidden rounded-surface bg-input-bg`}>
          {bannerUrl && failedBanner !== bannerUrl && (
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedBanner(bannerUrl)} />
          )}
        </div>
        <header className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={`flex ${operational ? "size-24 sm:size-28" : "size-20 sm:size-24"} shrink-0 items-center justify-center ${portrait ? "overflow-hidden rounded-full bg-operational-surface" : ""}`}>
            {avatarUrl && failedAvatar !== avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className={`h-full w-full ${portrait ? "object-cover object-[center_25%]" : "object-contain"}`}
                onError={() => setFailedAvatar(avatarUrl)}
              />
            ) : (
              <Icon name={portrait ? "user" : "building"} size={32} className="text-operational-muted" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="gap-1">
              <h1
                className={`break-words ${operational ? "text-operational-title" : "text-subtitle sm:text-title"} font-semi-bold leading-tight tracking-tight text-operational-ink`}>
                {name}
              </h1>
              {subtitle && <p className="text-body text-operational-muted">{subtitle}</p>}
            </div>
            {metadata && <div className="flex flex-wrap items-center gap-2">{metadata}</div>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {navigation}
        <div className={`flex min-w-0 flex-col ${operational ? "gap-6" : "gap-12"}`}>{children}</div>
      </div>
    </Wrapper>
  );
}
