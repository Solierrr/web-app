import SupportedLanguages from "../src/config/i18n/supported.enum";
import type { User } from "../src/features/users/user/user";
import type { Message } from "../src/features/messages/messages";
import type { Company } from "../src/features/companies/company";
import type { SaaSNavigationGroup } from "../src/features/saas/saas";
import { CompanyStatus } from "../src/features/companies/company.enum";
import { routePaths } from "../src/config/i18n/paths";
export const avatar = "/snowflake.svg";
export const banner = "/pattern/orange.jpg";
export const owner: User = {
  id: "storybook-owner",
  authId: "storybook-auth",
  active: true,
  name: "Ana Silva",
  cpf: "",
  birthDate: "1995-04-12",
  avatar,
};
export const colleague: User = { ...owner, id: "storybook-colleague", authId: "storybook-colleague-auth", name: "Pedro Costa" };
export const messages: Message[] = [
  { user: colleague, message: "Podemos revisar as etapas da instalação?", time: new Date("2026-10-12T12:00:00Z") },
  { user: owner, message: "Sim! Já organizei a agenda e os responsáveis do projeto.", time: new Date("2026-10-12T12:02:00Z") },
];
export const company: Company = {
  id: "storybook-company",
  status: CompanyStatus.APPROVED,
  type: "SUPPLIER",
  cnpj: "",
  tradeName: "Aurora Solar",
  corporateName: "Aurora Solar",
  slug: "aurora-solar",
  logoUrl: avatar,
  bannerUrl: banner,
};
export const groups: SaaSNavigationGroup[] = [
  {
    key: "overview",
    label: "navigation.groups.overview",
    items: [{ key: "dashboard", label: "navigation.items.dashboard", icon: "home", to: routePaths.dashboard }],
  },
  {
    key: "workspace",
    label: "navigation.groups.workspace",
    items: [
      { key: "projects", label: "navigation.items.projects", icon: "folder", to: routePaths.projects },
      { key: "messages", label: "navigation.items.messages", icon: "messagesSquare", to: routePaths.inbox },
    ],
  },
];
export const cartesian = {
  labels: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  series: [
    { name: "Geração", values: [12, 18, 14, 22, 25] },
    { name: "Consumo", values: [9, 12, 13, 16, 15] },
  ],
};
export const distribution = {
  items: [
    { label: "Instalação", value: 42 },
    { label: "Manutenção", value: 30 },
    { label: "Revisão", value: 28 },
  ],
};

export const language = SupportedLanguages.PTBR;
