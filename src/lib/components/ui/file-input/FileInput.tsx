import { useRef } from "react";
import { WhiteButton } from "@@/ui/button/Button.presets";
interface FileInputProps {
  name: string;
  label: string;
  disabled?: boolean;
  allowedTypes: readonly string[];
  maxBytes?: number;
  onChange: (file: File) => void;
  onError: (message: string) => void;
  invalidMessage: string;
}
export default function FileInput({
  name,
  label,
  disabled,
  allowedTypes,
  maxBytes = 10 * 1024 * 1024,
  onChange,
  onError,
  invalidMessage,
}: FileInputProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <input
        ref={input}
        name={name}
        aria-label={label}
        type="file"
        accept={allowedTypes.join(",")}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (!file.size || file.size > maxBytes || !allowedTypes.includes(file.type)) {
            onError(invalidMessage);
            return;
          }
          onChange(file);
        }}
      />
      <WhiteButton
        content={label}
        description={label}
        icon={{ name: "document" }}
        disabled={disabled}
        className="min-h-12 w-fit bg-input-bg! border-0!"
        onClick={() => input.current?.click()}
      />
    </div>
  );
}
