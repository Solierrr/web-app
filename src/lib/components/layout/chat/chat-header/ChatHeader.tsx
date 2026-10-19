import { useState, type ReactNode } from "react";
import Icon from "@@/ui/icon/Icon";

export default function ChatHeader({
  title,
  avatar,
  assistant = false,
  group = false,
  children,
}: {
  title: string;
  avatar?: string | null;
  assistant?: boolean;
  group?: boolean;
  children?: ReactNode;
}) {
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 bg-operational-surface py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-medium bg-input-bg text-operational-muted"
          aria-hidden="true">
          {avatar && avatar !== failedAvatar ? (
            <img src={avatar} alt="" className="size-full object-cover" onError={() => setFailedAvatar(avatar)} />
          ) : (
            <Icon name={assistant ? "sparkles" : group ? "users" : "user"} size={18} />
          )}
        </span>
        <h2 className="truncate text-body font-semi-bold text-operational-ink">{title}</h2>
      </div>
      {children}
    </header>
  );
}
