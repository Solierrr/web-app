import type { ComponentProps } from "react";
import Button from "./Button";
import type { IconName } from "../icon/Icon";
import Colors from "@/shared/styles/colors/colors.enum";

type ButtonPresetProps = Omit<ComponentProps<typeof Button>, "bgColor" | "txtColor">;
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
  return <Button {...props} bgColor={Colors.ORANGE} txtColor={Colors.WHITE} />;
}

/**
 * Secondary
 *
 * Botão de ação secundária, com o fundo neutro (preto).
 *
 * @param props - description, content/icon, rounded, disabled e demais propriedades do Button (exceto `bgColor`/`txtColor`).
 */
export function SecondaryButton(props: ButtonPresetProps) {
  return <Button {...props} bgColor={Colors.BLACK} txtColor={Colors.WHITE} />;
}

/**
 * Aspect
 *
 * Botão de ação principal com relevo 3D (gradiente e sombra), fundo laranja.
 *
 * @param props - description, content/icon, rounded, disabled e demais propriedades do Button (exceto `bgColor`/`txtColor`).
 */
export function AspectButton(props: ButtonPresetProps) {
  return <Button {...props} aspect bgColor={Colors.ORANGE} txtColor={Colors.WHITE} />;
}

/**
 * Icon
 *
 * Botão redondo apenas com ícone, fundo laranja e ícone branco.
 *
 * @param props - description, icon (nome do ícone), rounded, disabled e demais propriedades do Button (exceto `content`).
 */
export function IconButton({ icon, ...props }: IconButtonProps) {
  return <Button {...props} icon={{ name: icon }} bgColor={Colors.ORANGE} txtColor={Colors.WHITE} />;
}

/**
 * Light Icon
 *
 * Botão redondo apenas com ícone, fundo branco, ícone laranja e sombra suave.
 *
 * @param props - description, icon (nome do ícone), rounded, disabled e demais propriedades do Button (exceto `content`).
 */
export function LightIconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button {...props} icon={{ name: icon }} bgColor={Colors.WHITE} txtColor={Colors.ORANGE} className={`shadow-soft-black ${className ?? ""}`} />
  );
}

/**
 * Light Icon
 *
 * Botão redondo apenas com ícone, fundo branco, ícone laranja e sombra suave.
 *
 * @param props - description, icon (nome do ícone), rounded, disabled e demais propriedades do Button (exceto `content`).
 */
export function SoftIconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      icon={{ name: icon }}
      bgColor={Colors.WHITE}
      txtColor={Colors.ORANGE}
      rounded={false}
      className={`no-bg-interactive! ${className ?? ""}`}
    />
  );
}
