import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import { WhiteButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import FormError from "@@/feedback/toast/FormError";
import type { ImageAnalysisOptions } from "@/lib/shared/accessibility/aiAccessibility";
import { fileKey, useImageAnalysis } from "./ImageInput.hooks";

interface ImageInputProps {
  name: string;
  files: File[];
  onChange: (files: File[]) => void;
  onError: (message: string | null) => void;
  label: string;
  removeLabel: string;
  invalidMessage: string;
  summary: string;
  error?: string | null;
  progress?: string | null;
  disabled?: boolean;
  maxBytes?: number;
  multiple?: boolean;
  acceptedTypes?: readonly string[];
  analysis?: ImageAnalysisOptions;
  onAltTextChange?: (file: File, altText: string) => void;
}

function ImagePreview({ file, description }: { file: File; description: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={ref} alt={description} className="size-16 shrink-0 rounded-small bg-white object-contain" />;
}

export default function ImageInput({
  name,
  files,
  onChange,
  onError,
  label,
  removeLabel,
  invalidMessage,
  summary,
  error,
  progress,
  disabled = false,
  maxBytes = 8 * 1024 * 1024,
  multiple = true,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  analysis,
  onAltTextChange,
}: ImageInputProps) {
  const { t } = useTranslation("accessibility", { keyPrefix: "image" });
  const ref = useRef<HTMLInputElement>(null);
  const latestFiles = useRef(files);
  useEffect(() => {
    latestFiles.current = files;
  });
  const { analyzing, results, screen, setAltText } = useImageAnalysis(analysis);

  async function acceptAnalyzed(selected: File[]) {
    const current = latestFiles.current;
    const fresh = multiple ? selected.filter((file) => !current.some((item) => fileKey(item) === fileKey(file))) : selected.slice(0, 1);
    const { accepted, blocked } = await screen(fresh);
    if (blocked.length) onError(t(`blocked.${blocked[0].reason}`, { name: blocked[0].file.name }));
    if (!accepted.length) return;
    onChange(multiple ? [...latestFiles.current, ...accepted] : accepted.slice(0, 1));
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <input
        ref={ref}
        name={name}
        aria-label={label}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        disabled={disabled || analyzing}
        className="hidden"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (!selected.length) return;
          if (selected.some((file) => file.size === 0 || file.size > maxBytes || !acceptedTypes.includes(file.type))) {
            onError(invalidMessage);
            return;
          }
          onError(null);
          if (analysis) {
            void acceptAnalyzed(selected);
            return;
          }
          if (!multiple) {
            onChange(selected.slice(0, 1));
            return;
          }
          onChange([
            ...files,
            ...selected.filter(
              (file) =>
                !files.some((current) => current.name === file.name && current.size === file.size && current.lastModified === file.lastModified),
            ),
          ]);
        }}
      />
      <div className="flex min-w-0 items-center gap-3">
        <WhiteButton
          type="button"
          content={label}
          description={label}
          icon={{ name: "image", inverse: true }}
          disabled={disabled || analyzing}
          onClick={() => ref.current?.click()}
          className="min-h-12 w-fit shrink-0 bg-input-bg! border-0!"
        />
        <p role="status" aria-live="polite" className="min-w-0 text-body text-operational-muted">
          {progress ?? (analyzing ? t("analyzing") : summary)}
        </p>
      </div>
      <FormError message={error} />
      {files.length > 0 && (
        <ul className="flex min-w-0 flex-col gap-2">
          {files.map((file, index) => {
            const result = results[fileKey(file)];
            return (
              <li key={fileKey(file)} className="flex min-w-0 flex-col gap-2 rounded-medium bg-input-bg p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ImagePreview file={file} description={result?.altText || file.name} />
                  <span className="min-w-0 flex-1 break-words text-body">{file.name}</span>
                  <ToolbarAction
                    icon="x"
                    label={`${removeLabel}: ${file.name}`}
                    disabled={disabled}
                    onClick={() => {
                      onError(null);
                      onChange(files.filter((_, current) => current !== index));
                    }}
                  />
                </div>
                {result && (
                  <div className="flex min-w-0 flex-col gap-1">
                    <Input
                      name={`${name}AltText`}
                      aria-label={`${t("altLabel")}: ${file.name}`}
                      placeholder={t("altLabel")}
                      maxLength={150}
                      value={result.altText}
                      disabled={disabled}
                      onChange={(event) => {
                        setAltText(file, event.target.value);
                        onAltTextChange?.(file, event.target.value);
                      }}
                    />
                    <p className="text-sidebar-group text-operational-muted">
                      {result.suggested ? t("altSuggested") : t("altManual", { reason: result.failure ?? "" })}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
