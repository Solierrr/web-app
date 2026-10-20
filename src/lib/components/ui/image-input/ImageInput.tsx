import { useEffect, useRef } from "react";
import { WhiteButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import FormError from "@@/feedback/toast/FormError";

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
}

function ImagePreview({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={ref} alt={file.name} className="size-16 shrink-0 rounded-small bg-white object-contain" />;
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
}: ImageInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <input
        ref={ref}
        name={name}
        aria-label={label}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        disabled={disabled}
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
          disabled={disabled}
          onClick={() => ref.current?.click()}
          className="min-h-12 w-fit shrink-0 bg-input-bg! border-0!"
        />
        <p role="status" aria-live="polite" className="min-w-0 text-body text-operational-muted">
          {progress ?? summary}
        </p>
      </div>
      <FormError message={error} />
      {files.length > 0 && (
        <ul className="flex min-w-0 flex-col gap-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-w-0 items-center gap-3 rounded-medium bg-input-bg p-3">
              <ImagePreview file={file} />
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
