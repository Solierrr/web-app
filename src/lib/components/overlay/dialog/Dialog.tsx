import { useDialog } from "./Dialog.utils";
import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
export default function Dialog({
  title,
  children,
  onClose,
  busy = false,
  message,
  compact = false,
  variant = "default",
}: {
  title: string;
  children: ReactNode | ((dismiss: () => void, closing: boolean) => ReactNode);
  onClose: () => void;
  busy?: boolean;
  message?: string;
  compact?: boolean;
  variant?: "default" | "tonal";
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  const { t } = useTranslation("commons");
  const { closing, close } = useDialog(ref);
  function dismiss() {
    if (!busy) close(onClose);
  }
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-busy={busy}
      aria-describedby={message ? `${id}-message` : undefined}
      data-closing={closing || undefined}
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      className={`dialog-surface fixed inset-0 m-auto w-[calc(100%_-_2rem)] ${compact ? "max-w-md" : variant === "tonal" ? "max-w-xl" : "max-w-operational-form"} max-h-[85dvh] overflow-y-auto overscroll-contain rounded-surface border-0 ${variant === "tonal" ? "bg-surface-container px-5 pb-5 pt-12 sm:px-8 sm:pb-8" : "bg-white px-6 pb-6 pt-12"} text-operational-ink shadow-overlay backdrop:bg-dialog-backdrop`}>
      <ToolbarAction
        icon="x"
        label={t("actions.close", "Fechar")}
        color="var(--color-operational-muted)"
        backgroundColor="var(--color-operational-hover)"
        className="absolute right-3 top-3 h-8! w-8! rounded-full! focus-visible:outline-operational-ink!"
        onClick={dismiss}
        disabled={busy || closing}
      />
      <h2 id={id} className="mx-auto max-w-operational-copy text-center text-operational-title font-semi-bold leading-8">
        {title}
      </h2>
      {message && (
        <p id={`${id}-message`} className="mx-auto mt-3 max-w-operational-copy text-center text-operational-muted leading-6">
          {message}
        </p>
      )}
      <div className="mt-6">{typeof children === "function" ? children(dismiss, closing) : children}</div>
    </dialog>,
    document.body,
  );
}
