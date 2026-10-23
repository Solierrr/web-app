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
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-operational-border bg-operational-surface pb-3 pt-1">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_var(--color-operational-border)] text-operational-muted"
          aria-hidden="true">
          {avatar && avatar !== failedAvatar ? (
            <img src={avatar} alt="" className="size-full object-cover" onError={() => setFailedAvatar(avatar)} />
          ) : (
            <Icon name={assistant ? "sparkles" : group ? "users" : "user"} size={20} gradient={assistant ? "orange" : undefined} />
          )}
        </span>
        <h2 className="truncate text-body font-semi-bold text-operational-ink">{title}</h2>
      </div>
      {children}
    </header>
  );
}
