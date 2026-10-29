import { useState, type ReactNode } from "react";
import Icon from "@@/ui/icon/Icon";
import OrganicLogo from "@@/brand/logo/OrganicLogo";

export default function ChatHeader({
  title,
  avatar,
  assistant = false,
  group = false,
  column = false,
  status,
  children,
}: {
  title: string;
  avatar?: string | null;
  assistant?: boolean;
  group?: boolean;
  /** Alinha o título à coluna central das mensagens e do campo de texto; as ações ficam no canto direito. */
  column?: boolean;
  /** Linha curta sob o título, como presença ou "digitando". */
  status?: string;
  children?: ReactNode;
}) {
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  return (
    <header
      className={`sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 bg-transparent ${column ? "relative min-h-16.5" : "min-h-12"}`}>
      <div className={`flex min-w-0 items-center gap-3 ${column ? "mx-auto w-full max-w-3xl" : ""}`}>
        {assistant ? (
          <OrganicLogo width={2.75} decorative motion="expressive" rotateSymbol rotateShape holdMs={1571} transitionMs={1000} />
        ) : (
          <span
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_var(--color-operational-border)] text-operational-muted"
            aria-hidden="true">
            {avatar && avatar !== failedAvatar ? (
              <img src={avatar} alt="" className="size-full object-cover" onError={() => setFailedAvatar(avatar)} />
            ) : (
              <Icon name={assistant ? "sparkles" : group ? "users" : "user"} size={20} gradient={assistant ? "orange" : undefined} />
            )}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h2 className={assistant ? "sr-only" : "truncate text-body font-semi-bold text-operational-ink"}>{title}</h2>
          {status && (
            <p role="status" className="truncate text-sidebar text-operational-muted">
              {status}
            </p>
          )}
        </div>
      </div>
      {column ? <div className="absolute right-0 top-0">{children}</div> : children}
    </header>
  );
}
