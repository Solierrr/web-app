import type { RefObject } from "react";
import Popover from "@@/overlay/popover/Popover";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Select from "@@/ui/select/Select";
import { useTranslation } from "react-i18next";
import type { MessageFormat } from "./MessageComposer.formatting";
export default function MessageFormatting({
  anchorRef,
  onClose,
  onFormat,
  textType = "paragraph",
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onFormat: (format: MessageFormat) => void;
  textType?: "paragraph" | "h1" | "h2" | "h3";
}) {
  const { t } = useTranslation("chat", { keyPrefix: "formatting" });
  return (
    <Popover
      label={t("label")}
      anchorRef={anchorRef}
      onClose={onClose}
      placement="top"
      autoFocus={false}
      className="w-fit! max-w-[calc(100vw-2rem)] p-2!">
      <div role="toolbar" aria-label={t("label")} className="flex items-center gap-1">
        <Select
          name={t("textType")}
          className="[&_[role=listbox]]:bottom-full [&_[role=listbox]]:mb-1 [&_[role=listbox]]:mt-0"
          value={textType}
          clearable={false}
          options={[
            [t("paragraph"), "paragraph"],
            [t("h1"), "h1"],
            [t("h2"), "h2"],
            [t("h3"), "h3"],
          ]}
          onChange={(format) => {
            if (format) onFormat(format as MessageFormat);
          }}
        />
        <ToolbarAction content="B" label={t("bold")} className="font-bold!" onClick={() => onFormat("bold")} />
        <ToolbarAction content="I" label={t("italic")} className="italic" onClick={() => onFormat("italic")} />
      </div>
    </Popover>
  );
}
