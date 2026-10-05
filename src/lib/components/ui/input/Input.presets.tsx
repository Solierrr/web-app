import { useState, type ComponentProps } from "react";
import Input from "./Input";
import Combobox from "@@/ui/combobox/Combobox";

type InputPresetProps = Omit<ComponentProps<typeof Input>, "icon">;
type PasswordInputProps = Omit<InputPresetProps, "type"> & { showIcon?: boolean };

/**
 * Default
 *
 * Input sem ícone.
 *
 * @param props - name, placeholder, rounded e demais atributos nativos de input.
 */
export function DefaultInput(props: InputPresetProps) {
  return <Input {...props} />;
}

/**
 * Search
 *
 * Input com o ícone de lupa fixo à esquerda.
 *
 * @param props - name, placeholder, rounded e demais atributos nativos de input.
 */
export function SearchInput(props: InputPresetProps) {
  return <Input {...props} icon={{ name: "search", inverse: true }} />;
}

/**
 * Password
 *
 * Input de senha com botão pra alternar a visibilidade do valor digitado.
 *
 * @param props - name, placeholder, rounded e demais atributos nativos de input.
 * @param props.showIcon - Define se o botão de mostrar/esconder a senha aparece. Padrão: `true`.
 */
export function PasswordInput({ showIcon = true, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      icon={showIcon ? { name: visible ? "eyeOff" : "eye", inverse: false, onClick: () => setVisible((isVisible) => !isVisible) } : undefined}
    />
  );
}

const STATES = [
  ["Acre", "AC"],
  ["Alagoas", "AL"],
  ["Amapá", "AP"],
  ["Amazonas", "AM"],
  ["Bahia", "BA"],
  ["Ceará", "CE"],
  ["Distrito Federal", "DF"],
  ["Espírito Santo", "ES"],
  ["Goiás", "GO"],
  ["Maranhão", "MA"],
  ["Mato Grosso", "MT"],
  ["Mato Grosso do Sul", "MS"],
  ["Minas Gerais", "MG"],
  ["Pará", "PA"],
  ["Paraíba", "PB"],
  ["Paraná", "PR"],
  ["Pernambuco", "PE"],
  ["Piauí", "PI"],
  ["Rio de Janeiro", "RJ"],
  ["Rio Grande do Norte", "RN"],
  ["Rio Grande do Sul", "RS"],
  ["Rondônia", "RO"],
  ["Roraima", "RR"],
  ["Santa Catarina", "SC"],
  ["São Paulo", "SP"],
  ["Sergipe", "SE"],
  ["Tocantins", "TO"],
] as const;

type MaskedInputProps = Omit<InputPresetProps, "value" | "defaultValue" | "type" | "pattern" | "maxLength" | "inputMode"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function cepDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}
function cnpjCharacters(value: string) {
  const characters = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return characters.slice(0, 12) + characters.slice(12).replace(/\D/g, "").slice(0, 2);
}
function maskCep(value: string) {
  return value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value;
}
function maskCnpj(value: string) {
  return value
    .split("")
    .map((character, index) => `${index === 2 || index === 5 ? "." : index === 8 ? "/" : index === 12 ? "-" : ""}${character}`)
    .join("");
}

function MaskedInput({
  value,
  defaultValue = "",
  onChange,
  onValueChange,
  onKeyDown,
  normalize,
  format,
  ...props
}: MaskedInputProps & {
  normalize: (value: string) => string;
  format: (value: string) => string;
  pattern: string;
  maxLength: number;
  inputMode: "numeric" | "text";
}) {
  const [internal, setInternal] = useState(() => normalize(defaultValue));
  return (
    <Input
      {...props}
      type="text"
      value={format(normalize(value ?? internal))}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const input = event.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? start;
        if (start !== end) return;
        if (event.key === "Backspace" && start > 0 && /[^A-Z0-9]/i.test(input.value[start - 1])) {
          let from = start - 1;
          while (from > 0 && /[^A-Z0-9]/i.test(input.value[from])) from--;
          input.setSelectionRange(from, end);
        }
        if (event.key === "Delete" && start < input.value.length && /[^A-Z0-9]/i.test(input.value[start])) {
          let to = start;
          while (to < input.value.length && /[^A-Z0-9]/i.test(input.value[to])) to++;
          input.setSelectionRange(start, to + 1);
        }
      }}
      onChange={(event) => {
        const cursor = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
        const prefix = normalize(event.currentTarget.value.slice(0, cursor));
        const raw = normalize(event.currentTarget.value);
        const masked = format(raw);
        let position = 0;
        let count = 0;
        while (position < masked.length && count < prefix.length) {
          if (/[A-Z0-9]/i.test(masked[position])) count++;
          position++;
        }
        event.currentTarget.value = masked;
        event.currentTarget.setSelectionRange(position, position);
        setInternal(raw);
        onValueChange?.(raw);
        onChange?.(event);
      }}
    />
  );
}

export function CepInput(props: MaskedInputProps) {
  return <MaskedInput {...props} normalize={cepDigits} format={maskCep} pattern="[0-9]{5}-[0-9]{3}" maxLength={9} inputMode="numeric" />;
}

export function CnpjInput(props: MaskedInputProps) {
  return (
    <MaskedInput
      {...props}
      normalize={cnpjCharacters}
      format={maskCnpj}
      pattern="[A-Z0-9]{2}[.][A-Z0-9]{3}[.][A-Z0-9]{3}/[A-Z0-9]{4}-[0-9]{2}"
      maxLength={18}
      inputMode="text"
    />
  );
}

export function UfInput(props: Omit<ComponentProps<typeof Combobox>, "options" | "maxLength" | "normalize">) {
  return (
    <Combobox
      {...props}
      options={STATES}
      maxLength={2}
      normalize={(value) =>
        value
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 2)
      }
    />
  );
}
