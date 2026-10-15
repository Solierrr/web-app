import { useCallback, useRef, useState, type ReactNode } from "react";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Popover from "@@/overlay/popover/Popover";
import { useTranslation } from "react-i18next";

export default function TableRowOptions({ children, disabled = false, name }: { children?: ReactNode; disabled?: boolean; name?: string }) {
  const { t } = useTranslation("commons", { keyPrefix: "tableUi" });
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <ToolbarAction
        ref={anchor}
        icon="more"
        label={name ? `${t("rowOptions")}: ${name}` : t("rowOptions")}
        className="h-8! w-10!"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <Popover anchorRef={anchor} label={name ? `${t("rowOptions")}: ${name}` : t("rowOptions")} onClose={close} className="max-w-xs">
          <div className="flex flex-col gap-2 [&_div]:flex-col [&_button]:w-full! [&_button]:justify-start [&_button]:px-3 [&_button]:after:content-[attr(aria-label)] [&_a]:w-full! [&_a]:justify-start [&_a]:px-3 [&_a]:after:content-[attr(aria-label)]">
            {children}
          </div>
        </Popover>
      )}
    </>
  );
}
