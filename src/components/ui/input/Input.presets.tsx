import { useState, type ComponentProps } from "react";
import Input from "./Input";

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
      {...props} type={visible ? "text" : "password"}
      icon={showIcon ? { name: visible ? "eyeOff" : "eye", inverse: false, onClick: () => setVisible((isVisible) => !isVisible) } : undefined}
    />
  );
}
