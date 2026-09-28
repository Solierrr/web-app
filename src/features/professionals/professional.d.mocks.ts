import type { Professional } from "./professional";
import { TechnicalAffiliationType } from "./professional.enum";
import { slugNormalization } from "@/utils/normalization.utils";

const professionalMockData = [
  {
    id: "professional-1",
    name: "Carlos Eduardo Lima",
    avatar: "https://i.pravatar.cc/150?img=15",
    contact: {
      number: "31991112222",
      email: "carlos.lima@gmail.com",
      socialMedia: { whatsapp: true },
    },
    address: {
      street: "Rua das Palmeiras",
      number: "220",
      neighborhood: "Savassi",
      city: "Belo Horizonte",
      state: "MG",
      country: "Brasil",
      zipCode: "30140000",
    },
    geolocation: { latitude: -19.9386, longitude: -43.9378 },
    affiliationType: TechnicalAffiliationType.AFFILIATED,
    registrations: [{ profession: "Engenheiro Eletricista", council: "CREA-MG", number: "123456", expirationDate: "2027-03-01" }],
  },
  {
    id: "professional-2",
    name: "Fernanda Ribeiro Alves",
    avatar: "https://i.pravatar.cc/150?img=32",
    contact: {
      number: "41988882222",
      email: "fernanda.alves@outlook.com",
    },
    address: {
      street: "Rua XV de Novembro",
      number: "80",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      country: "Brasil",
      zipCode: "80020000",
    },
    geolocation: { latitude: -25.4296, longitude: -49.2713 },
    affiliationType: TechnicalAffiliationType.INDEPENDENT,
    registrations: [{ profession: "Técnica em Eletrotécnica", council: "CREA-PR", number: "654321", expirationDate: "2026-11-15" }],
  },
  {
    id: "professional-3",
    name: "João Pedro Martins",
    contact: {
      number: "81977773333",
      email: "joao.martins@hotmail.com",
      socialMedia: { linkedin: true },
    },
    address: {
      street: "Avenida Boa Viagem",
      number: "1500",
      neighborhood: "Boa Viagem",
      city: "Recife",
      state: "PE",
      country: "Brasil",
      zipCode: "51020000",
    },
    geolocation: { latitude: -8.1195, longitude: -34.9019 },
    affiliationType: TechnicalAffiliationType.PARTNER,
    registrations: [{ profession: "Engenheiro Eletricista", council: "CREA-PE", number: "789456", expirationDate: "2028-06-30" }],
  },
] as Professional[];

// `slug` não existe em `technician`/`person` no schema-api-core.sql: gerado
// aqui a partir de `name` até existir essa coluna (ou rota amigável
// equivalente) na API.
const professionalMock = professionalMockData.map((professional) => ({
  ...professional,
  slug: slugNormalization(professional.name),
})) as Professional[];

export default professionalMock;
