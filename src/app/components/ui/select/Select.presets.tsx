import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SelectOption } from "./Select";

/**
 * Default
 *
 * Select sem configuração adicional.
 *
 * @param props - name, options, value/defaultValue, onChange, placeholder, rounded, disabled e demais propriedades do Select.
 */
export function DefaultSelect<T = string>(props: ComponentProps<typeof Select<T>>) {
  return <Select {...props} />;
}

/**
 * Boolean
 *
 * Select de Sim/Não, já com as opções e a tipagem do valor (`boolean`) resolvidas.
 *
 * @param props - name, value/defaultValue, onChange, placeholder, rounded, disabled e demais propriedades do Select (exceto `options`).
 */
export function BooleanSelect(props: Omit<ComponentProps<typeof Select<boolean>>, "options">) {
  const { t } = useTranslation("commons");
  const options: SelectOption<boolean>[] = [
    [t("yes"), true],
    [t("no"), false],
  ];

  return <Select {...props} options={options} />;
}
