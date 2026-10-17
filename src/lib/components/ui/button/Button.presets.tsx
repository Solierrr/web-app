import type { ComponentProps } from "react";
import Button from "./Button";
import type { IconName } from "../icon/Icon";
import Colors from "@/lib/shared/styles/colors/colors.enum";

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

export function WhiteButton({ className = "", variant = "flat", ...props }: ButtonPresetProps) {
  return (
    <Button
      {...props}
      variant={variant}
      bgColor={Colors.WHITE}
      txtColor={Colors.BLACK}
      className={`${variant === "advanced" ? "aspect-button-white aspect-button-neutral" : variant === "soft" || variant === "surface" ? "" : "border-ui"} ${className}`}
    />
  );
}

/** Fundo branco com profundidade neutra; texto e ícone laranja. */
export function WhiteSoftButton(props: Omit<ButtonPresetProps, "variant">) {
  return <Button {...props} variant="soft" bgColor={Colors.WHITE} txtColor={Colors.ORANGE} />;
}

/** Fundo branco sólido, sem degradê ou sombra; conteúdo laranja. */
export function WhiteSolidButton({ className = "", ...props }: Omit<ButtonPresetProps, "variant">) {
  return <WhiteSoftButton {...props} className={`bg-none! shadow-none! ${className}`} />;
}

/** Ação discreta com fundo uniforme da área operacional. */
export function SurfaceButton(props: Omit<ButtonPresetProps, "variant">) {
  return <Button {...props} variant="surface" bgColor={Colors.WHITE} txtColor={Colors.BLACK} />;
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
