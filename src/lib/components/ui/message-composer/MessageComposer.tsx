import MessageFormatting from "./MessageFormatting";
import { formatMessageSelection, type MessageFormat } from "./MessageComposer.formatting";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { notify } from "@@/feedback/toast/Toast.utils";
import Textarea from "@@/ui/textarea/Textarea";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Instructions from "@@/ui/instructions/Instructions";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { MenuList, MenuItem } from "@@/overlay/Menu";
import useComposerSpeech from "./MessageComposer.speech";
import type { MessageAttachment } from "@/features/messages/messages";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  label: string;
  sendLabel: string;
  hint?: string;
  disabled?: boolean;
  maxLength?: number;
  compact?: boolean;
  assistant?: boolean;
  active?: boolean;
  attachments?: MessageAttachment[];
  onFilesSelected?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
}

export default function MessageComposer({
  value,
  onChange,
  onSend,
  placeholder,
  label,
  sendLabel,
  hint,
  disabled = false,
  maxLength,
  compact = false,
  assistant = false,
  active = true,
  attachments = [],
  onFilesSelected,
  onRemoveAttachment,
}: MessageComposerProps) {
  const { t, i18n } = useTranslation("chat");
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const attachmentMenu = useRef<HTMLDivElement>(null);
  const attachmentTrigger = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const closeFormatting = useCallback(() => setSelection(null), []);
  function captureSelection(input: HTMLTextAreaElement) {
    setSelection(!disabled && input.selectionEnd > input.selectionStart ? { start: input.selectionStart, end: input.selectionEnd } : null);
  }
  function applyFormat(format: MessageFormat) {
    const input = form.current?.querySelector("textarea");
    if (!input || !selection || disabled) return;
    const result = formatMessageSelection(value, selection.start, selection.end, format);
    if (maxLength && result.value.length > maxLength) {
      notify(t("formatting.tooLong"));
      return;
    }
    onChange(result.value);
    closeFormatting();
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(result.caret, result.caret);
    });
  }
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const speech = useComposerSpeech(compact && active && !disabled, value, onChange, i18n.resolvedLanguage ?? i18n.language, maxLength);
  useEffect(() => {
    if (!attachmentsOpen) return;
    attachmentMenu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function close(event: PointerEvent) {
      if (!attachmentMenu.current?.contains(event.target as Node)) setAttachmentsOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setAttachmentsOpen(false);
      attachmentTrigger.current?.focus();
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape, true);
    };
  }, [attachmentsOpen]);
  useLayoutEffect(() => {
    const input = form.current?.querySelector("textarea");
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [value]);
  useEffect(() => {
    if (!compact || !active) return;
    if (!speech.available || speech.failed || speech.listening) {
      notify(t(!speech.available ? "speech.denied" : speech.failed ? "speech.error" : "speech.listening"));
    }
  }, [compact, active, speech.available, speech.failed, speech.listening, t]);
  const headingLevel = selection ? /^#{1,3}\s/.exec(value.slice(value.lastIndexOf("\n", selection.start - 1) + 1))?.[0].trim().length : 0;
  const selectedTextType = headingLevel ? (`h${headingLevel}` as "h1" | "h2" | "h3") : "paragraph";
  const canSend = !disabled && !speech.listening && !speech.starting && (Boolean(value.trim()) || attachments.length > 0);
  return (
    <form
      ref={form}
      className={`relative shrink-0 rounded-medium bg-input-bg ${assistant ? "grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0 pl-4 pr-1 py-0" : `gap-2 p-3 ${compact ? "flex flex-col" : "grid grid-cols-[minmax(0,1fr)_auto] items-end"}`}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) {
          if (compact) speech.clear();
          onSend();
        }
      }}>
      <Textarea
        name={label}
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled || speech.listening || speech.starting}
        rows={1}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`w-full! bg-transparent! [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:px-0 [&_textarea]:py-0 [&_textarea]:leading-relaxed [&_textarea]:placeholder:text-operational-muted`}
        onSelect={(event) => captureSelection(event.currentTarget)}
        onMouseUp={(event) => captureSelection(event.currentTarget)}
        onTouchEnd={(event) => captureSelection(event.currentTarget)}
        onKeyUp={(event) => {
          if (event.key !== "Escape") captureSelection(event.currentTarget);
        }}
        onChange={(event) => {
          closeFormatting();
          onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && ["b", "i"].includes(event.key.toLowerCase()) && selection) {
            event.preventDefault();
            applyFormat(event.key.toLowerCase() === "b" ? "bold" : "italic");
            return;
          }
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) {
              if (compact) speech.clear();
              onSend();
            }
          }
        }}
      />
      {selection && active && !disabled && (
        <MessageFormatting anchorRef={form} onClose={closeFormatting} onFormat={applyFormat} textType={selectedTextType} />
      )}
      {attachments.length > 0 && (
        <ul className="col-span-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto scrollbar-none">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex min-w-0 max-w-full items-center gap-1 rounded-medium bg-white px-2 py-1">
              <Icon name={attachment.type.startsWith("image/") ? "image" : "document"} size={16} />
              <span className="truncate text-body">{attachment.name}</span>
              <ToolbarAction
                icon="x"
                label={t("attachments.remove", { name: attachment.name })}
                className="size-6!"
                onClick={() => onRemoveAttachment?.(attachment.id)}
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      )}
      <div
        className={`flex justify-between ${assistant ? "items-center gap-2" : "items-end gap-3"} ${assistant || !compact ? "col-start-2 row-start-1" : ""}`}>
        {hint && (
          <div id={`${id}-hint`} className="sr-only">
            <span className="inline-flex items-center gap-2">
              <Instructions items={["Enter"]} />
              {t("composerInstructions.send")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Instructions items={["Shift", "Enter"]} />
              {t("composerInstructions.newLine")}
            </span>
          </div>
        )}
        {compact && onFilesSelected && (
          <div ref={attachmentMenu} className="relative">
            <ToolbarAction
              ref={attachmentTrigger}
              icon={assistant ? "plus" : "paperclip"}
              label={t("attachments.add")}
              aria-expanded={attachmentsOpen && active}
              aria-controls={`${id}-attachments`}
              aria-haspopup="menu"
              className={assistant ? undefined : "size-8! rounded-full!"}
              iconSize={assistant ? 18 : 20}
              color={assistant ? "var(--color-operational-muted)" : undefined}
              disabled={disabled}
              onClick={() => setAttachmentsOpen((open) => !open)}
            />
            {attachmentsOpen && active && (
              <MenuList
                id={`${id}-attachments`}
                role="menu"
                aria-label={t("attachments.add")}
                className={`absolute bottom-full z-10 mb-2 w-52 ${assistant ? "right-0" : "left-0"}`}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                  event.preventDefault();
                  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
                  const selected = items.indexOf(document.activeElement as HTMLElement);
                  items[(selected + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
                }}>
                <MenuItem
                  role="menuitem"
                  onSelect={() => {
                    imageInput.current?.click();
                    setAttachmentsOpen(false);
                  }}>
                  <Icon name="image" size={18} />
                  <span className="text-body">{t("attachments.image")}</span>
                </MenuItem>
                <MenuItem
                  role="menuitem"
                  onSelect={() => {
                    documentInput.current?.click();
                    setAttachmentsOpen(false);
                  }}>
                  <Icon name="document" size={18} />
                  <span className="text-body">{t("attachments.document")}</span>
                </MenuItem>
              </MenuList>
            )}
            <input
              ref={imageInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              hidden
              onChange={(event) => {
                onFilesSelected(Array.from(event.currentTarget.files ?? []));
                event.currentTarget.value = "";
              }}
            />
            <input
              ref={documentInput}
              type="file"
              accept=".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              multiple
              hidden
              onChange={(event) => {
                onFilesSelected(Array.from(event.currentTarget.files ?? []));
                event.currentTarget.value = "";
              }}
            />
          </div>
        )}
        {compact && (
          <ToolbarAction
            icon={speech.listening ? "stop" : "microphone"}
            label={t(speech.listening ? "speech.stop" : "speech.start")}
            aria-pressed={speech.listening}
            className={`ml-auto ${assistant ? "" : "size-8! rounded-full!"}`}
            iconSize={assistant ? 18 : 20}
            color={speech.listening ? "var(--color-orange)" : "var(--color-operational-muted)"}
            disabled={disabled || speech.starting}
            onClick={() => {
              if (!speech.supported) notify(t("speech.unsupported"));
              else if (!speech.available) notify(t("speech.denied"));
              else {
                if (!speech.listening) notify(t("speech.denied"));
                void speech.toggle();
              }
            }}
          />
        )}
        <ToolbarAction
          type="submit"
          icon="arrowUp"
          label={sendLabel}
          className={`${assistant ? "" : "size-8! rounded-full!"} ${compact ? "" : "ml-auto"}`}
          iconSize={assistant ? 18 : 20}
          disabled={!canSend}
          color={assistant ? "var(--color-operational-ink)" : "var(--color-white)"}
          backgroundColor={assistant ? undefined : "var(--color-orange)"}
          hoverBackgroundColor={assistant ? undefined : "var(--color-dark-orange)"}
        />
      </div>
    </form>
  );
}
