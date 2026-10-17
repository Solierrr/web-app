import type { Meta, StoryObj } from "@storybook/react-vite";
import ValueField from "./ValueField";
const meta = {
  title: "UI/ValueField",
  component: ValueField,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, context) => (
      <div className="flex min-h-screen items-center justify-center bg-operational-surface p-6 text-operational-ink">
        <section className="flex w-full max-w-sm flex-col items-start gap-5 rounded-surface p-6">
          <h1 className="text-subtitle font-semi-bold">{context.name}</h1>
          <Story />
          <p className="text-body text-operational-muted">{context.args.comparison?.label ?? "Sem comparação: valor simples, com fundo branco."}</p>
        </section>
      </div>
    ),
  ],
  args: { children: "450 Wp", meter: { value: 450, min: 100, max: 600, label: "Potência relativa ao catálogo: 100 a 600 Wp" } },
} satisfies Meta<typeof ValueField>;
export default meta;
export const Default: StoryObj<typeof meta> = {};

export const AboveAverage: StoryObj<typeof meta> = {
  name: "Acima da média",
  args: {
    children: "550 Wp",
    meter: undefined,
    comparison: { direction: "above", position: 0.8, difference: 40, label: "550 Wp — 40 Wp acima da média de 510 Wp" },
  },
};
export const Efficiency: StoryObj<typeof meta> = {
  name: "Eficiência favorável",
  args: {
    children: "22,5 %",
    meter: undefined,
    comparison: { direction: "above", position: 0.8, difference: 0.7, favorable: true, label: "22,5% — 0,7 ponto percentual acima da média" },
  },
};
export const BelowAverage: StoryObj<typeof meta> = {
  name: "Abaixo da média",
  args: {
    children: "18 kg",
    meter: undefined,
    comparison: { direction: "below", position: 0.2, difference: -2, label: "18 kg — 2 kg abaixo da média de 20 kg; não indica qualidade" },
  },
};
export const Neutral: StoryObj<typeof meta> = {
  name: "Próximo da média",
  args: { children: "20 kg", meter: undefined, comparison: { direction: "near", position: 0.5, difference: 0, label: "20 kg — próximo da média" } },
};
export const Dimension: StoryObj<typeof meta> = {
  name: "Dimensões: posição na faixa",
  args: {
    children: "1,134 m",
    meter: undefined,
    comparison: {
      direction: "below",
      position: 0.3,
      difference: -0.1,
      representation: "range",
      label: "1,134 m — posição na faixa de larguras; abaixo da média",
    },
  },
};
export const WithoutReference: StoryObj<typeof meta> = { name: "Sem referência suficiente", args: { children: "1.250 Wp", meter: undefined } };
