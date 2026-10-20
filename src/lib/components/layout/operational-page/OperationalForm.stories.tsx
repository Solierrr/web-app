import type { Meta, StoryObj } from "@storybook/react-vite";
import OperationalForm, { FormSection, FormSurface } from "./OperationalForm";
import OperationalPage from "./OperationalPage";
import Input from "@@/ui/input/Input";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import { fn, expect, userEvent } from "storybook/test";
const fields = (
  <>
    <label className="flex flex-col gap-2">
      Nome do projeto
      <Input name="name" placeholder="Ex.: Instalação residencial" className="w-full" />
    </label>
    <FormSection title="Local do projeto" collapsible defaultExpanded={false}>
      <Input name="city" placeholder="Cidade" className="w-full" />
    </FormSection>
    <FormSection title="Previsão de execução" collapsible defaultExpanded={false}>
      <Input name="date" type="date" placeholder="Data prevista" className="w-full" />
    </FormSection>
    <PrimaryButton type="submit" content="Salvar projeto" description="Salvar projeto" className="w-full" />
    <WhiteSolidButton content="Cancelar" description="Cancelar" className="w-full" />
  </>
);
const meta = {
  title: "Layout/OperationalPage/Form",
  component: OperationalForm,
  subcomponents: { FormSection, FormSurface },
  args: { plain: true, children: fields, onSubmit: fn((event) => event.preventDefault()) },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-operational-form p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OperationalForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Plain: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Local do projeto" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  },
};
export const Surface: Story = { args: { plain: false } };
export const InPage: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <OperationalPage title="Novo projeto" centered form formBackground>
        <Story />
      </OperationalPage>
    ),
  ],
};
export const Section: Story = {
  render: () => (
    <FormSection title="Contato">
      <Input name="email" type="email" placeholder="contato@empresa.com" />
    </FormSection>
  ),
};
export const FormSurfaceOnly: Story = {
  render: () => (
    <FormSurface>
      <p>Superfície reutilizável do formulário.</p>
    </FormSurface>
  ),
};

export const Tonal: Story = {
  args: {
    tone: "tonal",
    children: (
      <>
        <div className="flex flex-col gap-5 rounded-surface bg-surface-container-low p-6">
          <label className="flex flex-col gap-2">
            Modelo
            <Input name="model" placeholder="Ex.: CS6W-550MS" className="w-full" />
          </label>
        </div>
        <FormSection variant="tonal" title="Características técnicas" collapsible defaultExpanded={false}>
          <Input name="power" suffix="Wp" placeholder="550" className="w-full" />
        </FormSection>
        <div className="grid grid-cols-2 gap-3">
          <WhiteSolidButton content="Cancelar" description="Cancelar" />
          <PrimaryButton content="Adicionar" description="Adicionar" />
        </div>
      </>
    ),
  },
};
