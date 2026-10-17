import type { Meta, StoryObj } from "@storybook/react-vite";
import Toast from "./Toast";
import { notify } from "./Toast.utils";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
const meta = { title: "Feedback/Toast", component: Toast, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  render: () => (
    <div className="flex min-h-96 flex-wrap items-start justify-center gap-3 p-8">
      <Toast />
      <PrimaryButton content="Exibir aviso" description="Exibir aviso" onClick={() => notify("Projeto atualizado com sucesso.")} />
      <WhiteSolidButton
        content="Empilhar avisos"
        description="Empilhar avisos"
        onClick={() => {
          notify("Atividade adicionada.");
          notify("Convite enviado.");
          notify("Informações salvas.");
        }}
      />
    </div>
  ),
};
