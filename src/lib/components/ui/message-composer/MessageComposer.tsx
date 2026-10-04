import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
  const canSend = !disabled && !speech.listening && !speech.starting && (Boolean(value.trim()) || attachments.length > 0);
  return (
    <form
      ref={form}
      className={`flex shrink-0 flex-col gap-3 rounded-hard bg-input-bg ${compact ? "p-3" : "p-4"} transition-shadow duration-250 focus-within:shadow-soft-orange motion-reduce:transition-none`}
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
        rows={compact ? 3 : 2}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`w-full! bg-transparent! [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:px-0 [&_textarea]:py-0 [&_textarea]:leading-relaxed [&_textarea]:placeholder:text-operational-muted ${compact ? "[&_textarea]:text-lower" : ""}`}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) {
              if (compact) speech.clear();
              onSend();
            }
          }
        }}
      />
      {attachments.length > 0 && (
        <ul className="flex max-h-24 flex-wrap gap-2 overflow-y-auto scrollbar-none">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex min-w-0 max-w-full items-center gap-1 rounded-medium bg-white px-2 py-1">
              <Icon name={attachment.type.startsWith("image/") ? "image" : "document"} size={16} />
              <span className="truncate text-lower">{attachment.name}</span>
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
      {compact && (!speech.supported || !speech.available || speech.failed || speech.listening) && (
        <p role="status" className="text-lower text-operational-muted">
          {t(!speech.supported ? "speech.unsupported" : !speech.available ? "speech.denied" : speech.failed ? "speech.error" : "speech.listening")}
        </p>
      )}
      <div className="flex items-end justify-between gap-3">
        {hint && (
          <div id={`${id}-hint`} className={compact ? "sr-only" : "flex flex-wrap items-center gap-x-4 gap-y-2 text-lower text-operational-muted"}>
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
              icon="paperclip"
              label={t("attachments.add")}
              aria-expanded={attachmentsOpen && active}
              aria-controls={`${id}-attachments`}
              aria-haspopup="menu"
              className="size-8! rounded-full!"
              disabled={disabled}
              onClick={() => setAttachmentsOpen((open) => !open)}
            />
            {attachmentsOpen && active && (
              <MenuList
                id={`${id}-attachments`}
                role="menu"
                aria-label={t("attachments.add")}
                className="absolute bottom-full left-0 z-10 mb-2 w-52"
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
                  <span className="text-lower">{t("attachments.image")}</span>
                </MenuItem>
                <MenuItem
                  role="menuitem"
                  onSelect={() => {
                    documentInput.current?.click();
                    setAttachmentsOpen(false);
                  }}>
                  <Icon name="document" size={18} />
                  <span className="text-lower">{t("attachments.document")}</span>
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
            className="ml-auto size-8! rounded-full!"
            color={speech.listening ? "var(--color-orange)" : "var(--color-operational-muted)"}
            disabled={disabled || speech.starting || !speech.supported || !speech.available}
            onClick={() => void speech.toggle()}
          />
        )}
        <ToolbarAction
          type="submit"
          icon={compact ? "arrowUp" : "send"}
          label={sendLabel}
          className={compact ? "size-8! rounded-full!" : "ml-auto"}
          disabled={!canSend}
          color="var(--color-white)"
          backgroundColor="var(--color-orange)"
          hoverBackgroundColor="var(--color-dark-orange)"
        />
      </div>
    </form>
  );
}
