import type { Meta, StoryObj } from "@storybook/react-vite";
import OperationalDetails, { DetailSection, DetailField } from "./OperationalDetails";
const meta = {
  title: "Layout/OperationalPage/Details",
  component: DetailSection,
  subcomponents: { OperationalDetails, DetailField },
  args: { title: "Desempenho", children: null },
} satisfies Meta<typeof DetailSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <DetailSection title="Desempenho">
      <DetailField prominent label="Potência" value="450 Wp" />
      <DetailField prominent label="Eficiência" value="22 %" />
    </DetailSection>
  ),
};

export const SharedLayout: Story = {
  render: () => (
    <OperationalDetails
      title="Informações gerais"
      media={<div className="flex min-h-64 items-center justify-center rounded-medium bg-white p-6">Imagem do registro</div>}>
      <DetailSection plain title="Desempenho">
        <DetailField prominent label="Potência" value="450 Wp" />
        <DetailField prominent label="Eficiência" value="22 %" />
      </DetailSection>
      <DetailSection plain title="Identificação">
        <DetailField label="Marca" value="Solaria" />
        <DetailField label="Modelo" value="S-450" />
      </DetailSection>
    </OperationalDetails>
  ),
};
