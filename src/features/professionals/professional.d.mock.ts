import { mockProfessionalImages } from "@/config/mocks/catalogMedia";
import type { Professional } from "./professional";
import { TechnicalAffiliationType } from "./professional.enum";
import { slugNormalization } from "@/lib/utils/normalization.utils";

const professionalMockData = [
  {
    id: "professional-1",
    name: "Carlos Eduardo Lima",

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
  {
    id: "professional-4",
    name: "Marina Costa",
    contact: {
      email: "profissional-4@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "100",
      neighborhood: "Centro",
      city: "Campinas",
      state: "SP",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -22.9056,
      longitude: -47.0608,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-SP",
        number: "100000",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-5",
    name: "Rafael Nunes",
    contact: {
      email: "profissional-5@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "101",
      neighborhood: "Centro",
      city: "Florianópolis",
      state: "SC",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -27.5954,
      longitude: -48.548,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Instalação solar",
        council: "CREA-SC",
        number: "100001",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-6",
    name: "Beatriz Souza",
    contact: {
      email: "profissional-6@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "102",
      neighborhood: "Centro",
      city: "Porto Alegre",
      state: "RS",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -30.0346,
      longitude: -51.2177,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Manutenção solar",
        council: "CREA-RS",
        number: "100002",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-7",
    name: "Lucas Ferreira",
    contact: {
      email: "profissional-7@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "103",
      neighborhood: "Centro",
      city: "Fortaleza",
      state: "CE",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -3.7319,
      longitude: -38.5267,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Inspeção técnica",
        council: "CREA-CE",
        number: "100003",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-8",
    name: "Camila Rocha",
    contact: {
      email: "profissional-8@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "104",
      neighborhood: "Centro",
      city: "Belém",
      state: "PA",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -1.4558,
      longitude: -48.4902,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-PA",
        number: "100004",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-9",
    name: "André Almeida",
    contact: {
      email: "profissional-9@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "105",
      neighborhood: "Centro",
      city: "Goiânia",
      state: "GO",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -16.6869,
      longitude: -49.2648,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Instalação solar",
        council: "CREA-GO",
        number: "100005",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-10",
    name: "Juliana Melo",
    contact: {
      email: "profissional-10@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "106",
      neighborhood: "Centro",
      city: "Brasília",
      state: "DF",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -15.7939,
      longitude: -47.8828,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Manutenção solar",
        council: "CREA-DF",
        number: "100006",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-11",
    name: "Thiago Santos",
    contact: {
      email: "profissional-11@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "107",
      neighborhood: "Centro",
      city: "Salvador",
      state: "BA",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -12.9777,
      longitude: -38.5016,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Inspeção técnica",
        council: "CREA-BA",
        number: "100007",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-12",
    name: "Isabela Martins",
    contact: {
      email: "profissional-12@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "108",
      neighborhood: "Centro",
      city: "Joinville",
      state: "SC",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -26.3044,
      longitude: -48.8487,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-SC",
        number: "100008",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-13",
    name: "Pedro Ribeiro",
    contact: {
      email: "profissional-13@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "109",
      neighborhood: "Centro",
      city: "Vitória",
      state: "ES",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -20.3155,
      longitude: -40.3128,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Instalação solar",
        council: "CREA-ES",
        number: "100009",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-14",
    name: "Larissa Dias",
    contact: {
      email: "profissional-14@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "110",
      neighborhood: "Centro",
      city: "Natal",
      state: "RN",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -5.7945,
      longitude: -35.211,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Manutenção solar",
        council: "CREA-RN",
        number: "100010",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-15",
    name: "Bruno Oliveira",
    contact: {
      email: "profissional-15@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "111",
      neighborhood: "Centro",
      city: "João Pessoa",
      state: "PB",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -7.1195,
      longitude: -34.845,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Inspeção técnica",
        council: "CREA-PB",
        number: "100011",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-16",
    name: "Renata Vieira",
    contact: {
      email: "profissional-16@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "112",
      neighborhood: "Centro",
      city: "Ribeirão Preto",
      state: "SP",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -21.1775,
      longitude: -47.8103,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-SP",
        number: "100012",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-17",
    name: "Daniel Pinto",
    contact: {
      email: "profissional-17@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "113",
      neighborhood: "Centro",
      city: "Maringá",
      state: "PR",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -23.4205,
      longitude: -51.9331,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Instalação solar",
        council: "CREA-PR",
        number: "100013",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-18",
    name: "Paula Mendes",
    contact: {
      email: "profissional-18@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "114",
      neighborhood: "Centro",
      city: "Uberlândia",
      state: "MG",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -18.9146,
      longitude: -48.2754,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Manutenção solar",
        council: "CREA-MG",
        number: "100014",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-19",
    name: "Gustavo Castro",
    contact: {
      email: "profissional-19@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "115",
      neighborhood: "Centro",
      city: "Sorocaba",
      state: "SP",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -23.5015,
      longitude: -47.4526,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Inspeção técnica",
        council: "CREA-SP",
        number: "100015",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-20",
    name: "Ana Duarte",
    contact: {
      email: "profissional-20@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "116",
      neighborhood: "Centro",
      city: "Maceió",
      state: "AL",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -9.6658,
      longitude: -35.735,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-AL",
        number: "100016",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-21",
    name: "Felipe Barros",
    contact: {
      email: "profissional-21@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "117",
      neighborhood: "Centro",
      city: "São Luís",
      state: "MA",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -2.5307,
      longitude: -44.3068,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Instalação solar",
        council: "CREA-MA",
        number: "100017",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-22",
    name: "Carolina Azevedo",
    contact: {
      email: "profissional-22@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "118",
      neighborhood: "Centro",
      city: "Cuiabá",
      state: "MT",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -15.6014,
      longitude: -56.0979,
    },
    affiliationType: "INDEPENDENT",
    registrations: [
      {
        profession: "Manutenção solar",
        council: "CREA-MT",
        number: "100018",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-23",
    name: "Diego Cardoso",
    contact: {
      email: "profissional-23@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "119",
      neighborhood: "Centro",
      city: "Aracaju",
      state: "SE",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -10.9472,
      longitude: -37.0731,
    },
    affiliationType: "AFFILIATED",
    registrations: [
      {
        profession: "Inspeção técnica",
        council: "CREA-SE",
        number: "100019",
        expirationDate: "2028-12-31",
      },
    ],
  },
  {
    id: "professional-24",
    name: "Sofia Teixeira",
    contact: {
      email: "profissional-24@example.com",
    },
    address: {
      street: "Avenida Central",
      number: "120",
      neighborhood: "Centro",
      city: "Londrina",
      state: "PR",
      country: "Brasil",
      zipCode: "01001000",
    },
    geolocation: {
      latitude: -23.3045,
      longitude: -51.1696,
    },
    affiliationType: "PARTNER",
    registrations: [
      {
        profession: "Engenharia elétrica",
        council: "CREA-PR",
        number: "100020",
        expirationDate: "2028-12-31",
      },
    ],
  },
] as Professional[];

// `slug` não existe em `technician`/`person` no schema-api-core.sql: gerado
// aqui a partir de `name` até existir essa coluna (ou rota amigável
// equivalente) na API.
const professionalMock = professionalMockData.map((professional, index) => ({
  ...professional,
  avatar: mockProfessionalImages[index],
  slug: slugNormalization(professional.name),
})) as Professional[];

export default professionalMock;
