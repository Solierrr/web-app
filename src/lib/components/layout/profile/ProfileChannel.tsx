import { useState, type ReactNode } from "react";
import WrapperLayout from "@/config/WrapperLayout";
import Icon from "@@/ui/icon/Icon";

interface ProfileChannelProps {
  name: string;
  bannerUrl?: string;
  avatarUrl?: string;
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
    <Wrapper className={operational ? "mx-auto w-full max-w-operational-page px-4 py-6 sm:px-8 lg:px-10" : undefined}>
      <div className="flex min-w-0 flex-col gap-6 py-4">
        <div className="aspect-[6/1] min-h-28 w-full overflow-hidden rounded-surface bg-input-bg sm:min-h-36">
          {bannerUrl && failedBanner !== bannerUrl && (
            <img src={bannerUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedBanner(bannerUrl)} />
          )}
        </div>
        <header className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-medium bg-white sm:size-28">
            {avatarUrl && failedAvatar !== avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-contain" onError={() => setFailedAvatar(avatarUrl)} />
            ) : (
              <Icon name="building" size={32} className="text-operational-muted" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h1 className="break-words text-operational-title font-semi-bold leading-8 text-operational-ink">{name}</h1>
            {subtitle && <p className="text-body text-operational-muted">{subtitle}</p>}
            {metadata && <div className="flex flex-wrap items-center gap-2">{metadata}</div>}
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </header>
        {navigation}
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    </Wrapper>
  );
}
