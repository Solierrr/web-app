import type { Company } from "./company";
import { CompanyActivity } from "./company.enum";
import { slugNormalization } from "@/lib/utils/normalization.utils";

const companyMockData = [
  {
    id: "company-1",
    type: "SUPPLIER",
    activities: [CompanyActivity.SOLAR_PANELS, CompanyActivity.MAINTENANCE],
    status: "APPROVED",
    cnpj: "12345678000190",
    tradeName: "Solaria Energia",
    corporateName: "Solaria Energia Solar Ltda",

    address: {
      street: "Avenida das Nações",
      number: "1200",
      complement: "Galpão 3",
      neighborhood: "Distrito Industrial",
      city: "Belo Horizonte",
      state: "MG",
      country: "Brasil",
      zipCode: "31170000",
    },
    businessContact: {
      companyEmail: "contato@solariaenergia.com.br",
      phone: "31999998888",
      website: "https://www.solariaenergia.com.br",
    },
  },
  {
    id: "company-2",
    status: "UNDER_ANALYSIS",
    cnpj: "98765432000155",
    tradeName: "Helios Instalações Solares",
    corporateName: "Helios Instalações Solares Ltda",
    address: {
      street: "Rua dos Andradas",
      number: "455",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      country: "Brasil",
      zipCode: "80010001",
    },
    businessContact: {
      companyEmail: "financeiro@heliossolar.com.br",
      phone: "41998887777",
    },
  },
  {
    id: "company-3",
    status: "REJECTED",
    cnpj: "11222333000144",
    tradeName: "Lumina Painéis Fotovoltaicos",
    corporateName: "Lumina Comércio de Painéis Fotovoltaicos Ltda",
    address: {
      street: "Rua Sete de Setembro",
      number: "88",
      complement: "Sala 12",
      neighborhood: "Boa Vista",
      city: "Recife",
      state: "PE",
      country: "Brasil",
      zipCode: "50060000",
    },
    businessContact: {
      companyEmail: "contato@luminafv.com.br",
      phone: "81997776666",
      website: "https://www.luminafv.com.br",
    },
  },
  {
    id: "company-4",
    hasTechnicalTeam: true,
    type: "SUPPLIER",
    status: "APPROVED",
    cnpj: "12345678000433",
    tradeName: "Equipe Solar",
    corporateName: "Equipe Solar Serviços Ltda",
    logoUrl: "/images/mocks/companies/logos/company-04.jpg",
    bannerUrl: "/images/mocks/companies/banners/company-04.jpg",
    activities: [CompanyActivity.TECHNICIANS, CompanyActivity.MAINTENANCE],
    address: { street: "Rua Solar", number: "100", neighborhood: "Centro", city: "São Paulo", state: "SP", country: "Brasil", zipCode: "01001000" },
  },
  {
    id: "company-5",
    type: "SUPPLIER",
    status: "APPROVED",
    cnpj: "12345678000514",
    tradeName: "Revisa Energia",
    corporateName: "Revisa Energia Inspeções Ltda",
    logoUrl: "/images/mocks/companies/logos/company-05.jpg",
    bannerUrl: "/images/mocks/companies/banners/company-05.jpg",
    activities: [CompanyActivity.INSPECTION, CompanyActivity.MAINTENANCE],
    address: {
      street: "Rua da Energia",
      number: "200",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      country: "Brasil",
      zipCode: "80010000",
    },
  },
  {
    id: "company-6",
    type: "DEMANDANT",
    status: "APPROVED",
    cnpj: "12345678000603",
    tradeName: "Horizonte Energia",
    corporateName: "Horizonte Energia Ltda",
    activities: [],
    logoUrl: "/images/mocks/companies/logos/company-06.jpg",
    bannerUrl: "/images/mocks/companies/banners/company-06.jpg",
    address: { street: "Rua Horizonte", number: "300", neighborhood: "Centro", city: "Recife", state: "PE", country: "Brasil", zipCode: "50060000" },
  },
] as Company[];

// `slug` não existe em `company` no schema-api-core.sql: gerado aqui a partir
// de `tradeName` até existir essa coluna (ou rota amigável equivalente) na API.
const companyMock = companyMockData.map((company) => ({
  ...company,
  slug: slugNormalization(company.tradeName),
})) as Company[];

export default companyMock;
