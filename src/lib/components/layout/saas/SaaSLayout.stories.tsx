import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaaSLayout } from "./SaaSLayout";
import { Routes, Route } from "react-router-dom";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalDetails, { DetailSection, DetailField } from "@@/layout/operational-page/OperationalDetails";
import { ActiveContextProvider } from "../../../../../.storybook/mocks/ActiveContext";
function DemoPage() {
  return (
    <OperationalPage title="Projetos" description="Área de trabalho do Solaria — dados demonstrativos." centered sideBackground>
      <OperationalDetails title="Instalação residencial">
        <DetailSection title="Informações" plain>
          <DetailField label="Local" value="São Paulo / SP" />
          <DetailField label="Situação" value="Planejado" />
        </DetailSection>
      </OperationalDetails>
    </OperationalPage>
  );
}
const meta = {
  title: "Layout/SaaS/Shell",
  component: SaaSLayout,
  parameters: { layout: "fullscreen", router: { path: "/pt-BR/projetos" } },
  render: () => (
    <Routes>
      <Route element={<SaaSLayout />}>
        <Route path="*" element={<DemoPage />} />
      </Route>
    </Routes>
  ),
} satisfies Meta<typeof SaaSLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Company: Story = {};
export const Personal: Story = {
  decorators: [
    (Story) => (
      <ActiveContextProvider initialKind="personal">
        <Story />
      </ActiveContextProvider>
    ),
  ],
};
export const PlatformAdmin: Story = {
  decorators: [
    (Story) => (
      <ActiveContextProvider platformAdmin>
        <Story />
      </ActiveContextProvider>
    ),
  ],
};
