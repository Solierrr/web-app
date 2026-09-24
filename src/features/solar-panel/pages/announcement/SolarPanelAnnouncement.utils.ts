import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { Capitalize } from "@/config/inter/utils";

export interface RegionsServiceI18n {
  message: string;
  and: string;
}

export function regionsService(regions: string[], { message, and }: RegionsServiceI18n): string {
  let result = "";
  if (regions.length == 1) result = regions[0];
  else if (regions.length == 2) result = `${regions[0]} ${and} ${regions[1]}`;
  else if (regions.length > 2) result = `${regions[0]}, ${regions[1]} ${and} ${regions[2]}`;

  return `${Capitalize(message)} ${result}`;
}

export interface Characteristic {
  label: string;
  value: string;
}

export interface CharacteristicsI18n {
  widthAndLength: string;
  weight: string;
  brand: string;
  model: string;
  solarPanelType: string;
  potency: string;
  efficiency: string;
  unity: string;
}

export function panelCharacteristics(
  panel: SolarPanel,
  { widthAndLength, weight, brand, model, solarPanelType, potency, efficiency, unity }: CharacteristicsI18n,
): Characteristic[] {
  const characteristics: Characteristic[] = [];

  if (panel.dimension) {
    characteristics.push({
      label: widthAndLength,
      value: `${panel.dimension.width.toFixed(3)} m x ${panel.dimension.length.toFixed(2)} m`,
    });
  }
  if (panel.weight !== undefined) {
    characteristics.push({
      label: weight,
      value: `${panel.weight} kg / ${unity}`,
    });
  }

  if (panel.brand) {
    characteristics.push({ label: brand, value: panel.brand });
  }

  if (panel.model) {
    characteristics.push({ label: model, value: panel.model });
  }

  if (panel.type) {
    characteristics.push({ label: solarPanelType, value: panel.type });
  }

  if (panel.powerOutput !== undefined) {
    characteristics.push({
      label: potency,
      value: `${panel.powerOutput} W`,
    });
  }
  if (panel.efficiency !== undefined) {
    characteristics.push({
      label: efficiency,
      value: `${panel.efficiency} %`,
    });
  }

  return characteristics;
}
