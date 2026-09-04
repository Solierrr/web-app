import type { Meta, StoryObj } from "@storybook/react-vite";
import EntityCorridor from "./EntityCorridor";
import professionalMock from "@/features/professionals/professional.d.mock";
import companyMock from "@/features/companies/company.d.mock";
import { toCardItem as toProfessionalCardItem } from "@app/pages/feed/professional/ProfessionalFeed.utils";
import { toCardItem as toCompanyCardItem } from "@app/pages/feed/company/CompanyFeed.utils";
import { DEFAULT as DEFAULT_LANGUAGE } from "@/config/inter/browser/languages";

const meta = {
  title: "Layout/Announcement/EntityCorridor",
  component: EntityCorridor,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof EntityCorridor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Professionals: Story = {
  args: {
    title: "Profissionais credenciados",
    items: professionalMock.map((professional) => toProfessionalCardItem(professional, DEFAULT_LANGUAGE)),
  },
};

export const Companies: Story = {
  args: {
    title: "Empresas credenciadas",
    items: companyMock.map((company) => toCompanyCardItem(company, DEFAULT_LANGUAGE)),
  },
};
