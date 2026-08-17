import { useState, type ComponentProps } from "react";
import { Textarea } from "./Textarea";

type TextareaPresetProps = ComponentProps<typeof Textarea>;
type CharCountTextareaProps = Omit<TextareaPresetProps, "value" | "defaultValue"> & {
  maxLength:     number;
  value?:        string;
  defaultValue?: string;
};

/**
 * Default
 *
 * Textarea sem configuração adicional.
 *
 * @param props - name, placeholder, rows e demais atributos nativos de textarea.
 */
export function DefaultTextarea(props: TextareaPresetProps) {
  return <Textarea {...props} />;
}

/**
 * CharCount
 *
 * Textarea com contador de caracteres digitados, respeitando `maxLength`.
 *
 * @param props - name, placeholder, rows e demais atributos nativos de textarea.
 * @param props.maxLength - Quantidade máxima de caracteres permitida.
 */
export function CharCountTextarea({ maxLength, value, defaultValue, onChange, ...props }: CharCountTextareaProps) {
  const [length, setLength] = useState((value ?? defaultValue ?? "").length);

  return (
    <div className="flex w-fit flex-col gap-1">
      <Textarea
        {...props} value={value} defaultValue={defaultValue} maxLength={maxLength}
        onChange={(event) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
      />
      <span className="text-caption text-input-text self-end">{length}/{maxLength}</span>
    </div>
  );
}
