import type { ComponentProps } from "react";
import Button from "./Button";
import type { IconName } from "../icon/Icon";
import Colors from "@/shared/styles/colors/colors.enum";

type ButtonPresetProps = Omit<
  ComponentProps<typeof Button>,
  "bgColor" | "txtColor"
>;
type IconButtonProps = Omit<ButtonPresetProps, "content" | "icon"> & {
  icon: IconName;
};

/**
 * Primary
 *
 * Botão de ação principal, com o fundo laranja padrão.
 *
 * @param props - description, content/icon, rounded, disabled e demais propriedades do Button (exceto `bgColor`/`txtColor`).
 */
export function PrimaryButton(props: ButtonPresetProps) {
  return <Button {...props} bgColor={Colors.Orange} txtColor={Colors.White} />;
}

/**
 * Secondary
 *
 * Botão de ação secundária, com o fundo neutro (preto).
 *
 * @param props - description, content/icon, rounded, disabled e demais propriedades do Button (exceto `bgColor`/`txtColor`).
 */
export function SecondaryButton(props: ButtonPresetProps) {
  return <Button {...props} bgColor={Colors.Black} txtColor={Colors.White} />;
}

/**
 * Icon
 *
 * Botão redondo apenas com ícone, fundo laranja e ícone branco.
 *
 * @param props - description, icon (nome do ícone), rounded, disabled e demais propriedades do Button (exceto `content`).
 */
export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      icon={{ name: icon }}
      bgColor={Colors.Orange}
      txtColor={Colors.White}
    />
  );
}

/**
 * Light Icon
 *
 * Botão redondo apenas com ícone, fundo branco, ícone laranja e sombra suave.
 *
 * @param props - description, icon (nome do ícone), rounded, disabled e demais propriedades do Button (exceto `content`).
 */
export function LightIconButton({
  icon,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      icon={{ name: icon }}
      bgColor={Colors.White}
      txtColor={Colors.Orange}
      className={`shadow-soft ${className ?? ""}`}
    />
  );
}
