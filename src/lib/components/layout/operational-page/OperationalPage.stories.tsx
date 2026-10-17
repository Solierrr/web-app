import type { Meta, StoryObj } from "@storybook/react-vite";
import OperationalPage from "./OperationalPage";
import Surface from "@@/ui/surface/Surface";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
const meta = {
  title: "Layout/OperationalPage/Page",
  component: OperationalPage,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Projetos",
    description: "Organize etapas, envolvidos e documentos em um espaço privado.",
    centered: true,
    sideBackground: true,
    children: (
      <Surface>
        <div className="p-6">Conteúdo do projeto</div>
      </Surface>
    ),
    actions: <PrimaryButton content="Criar projeto" description="Criar projeto" />,
  },
} satisfies Meta<typeof OperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Centered: Story = {};
export const LeftAligned: Story = { args: { centered: false, sideBackground: false } };
export const Loading: Story = { args: { loading: true } };
export const Form: Story = { args: { title: "Novo projeto", form: true, formBackground: true, actions: null } };
export const WithBreadcrumbs: Story = {
  args: { breadcrumbs: <Breadcrumbs label="Navegação" items={[{ label: "Projetos", to: "/pt-BR/projetos" }, { label: "Novo projeto" }]} /> },
};
