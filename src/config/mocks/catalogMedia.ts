const productImages = import.meta.glob<string>("/src/assets/mocks/products/*.webp", { eager: true, query: "?url", import: "default" });
const companyBanners = import.meta.glob<string>("/src/assets/mocks/banners/*.webp", { eager: true, query: "?url", import: "default" });
const companyLogos = import.meta.glob<string>("/src/assets/mocks/logos/*.webp", { eager: true, query: "?url", import: "default" });

function panelImages(ids: string[]) {
  return ids.map((id) => productImages[`/src/assets/mocks/products/solar-panels-${id}.webp`]);
}

export const mockProductImages = {
  mono: panelImages(["f2b8091a5514", "ce357c4824dc", "17f09f77521e", "543e3d5df368", "7c9d6ecffa6a"]),
  poly: panelImages(["845330193b5d", "81a9071c4bd3"]),
  thin: panelImages(["cb5e6ad13123", "366e278f4030", "6deae5edced4"]),
};
export const mockCompanyBanners = Object.keys(companyBanners)
  .sort()
  .map((key) => companyBanners[key]);

export const mockCompanyLogos = Object.keys(companyLogos)
  .sort()
  .map((key) => companyLogos[key]);

const professionalImages = import.meta.glob<string>("/src/assets/mocks/professionals/*.webp", { eager: true, query: "?url", import: "default" });

export const mockProfessionalImages = [
  "pfp-2fabb73dfceb",
  "pfp-suitman-361d865077fc",
  "pfp-364d44e19195",
  "pfp-suitman-e880a09cbb05",
  "pfp-f6db60ff7a6f",
  "pfp-suitman-9b59e51e0145",
  "pfp-a328e978c0ad",
  "pfp-suitman-03654a5f350c",
  "pfp-58c240a07114",
  "pfp-suitman-e6e8123e3625",
  "pfp-1be2a1bd5941",
  "pfp-suitman-54ee070be4c1",
  "pfp-c6b27947197a",
  "pfp-suitman-451a29b02f7f",
  "pfp-688dfc5aa05a",
  "pfp-suitman-bcbd5d0a8289",
  "pfp-8d242a32b3ba",
  "pfp-suitman-65f40d36c5b2",
  "pfp-18bac163d5bc",
  "users-pfp-clients-aa4774e51bbf",
  "pfp-876b591b9ce4",
  "users-pfp-clients-dcdc042ea6bd",
  "pfp-5fd1f1157bce",
  "users-pfp-clients-ec0398607d90",
].map((id) => professionalImages[`/src/assets/mocks/professionals/${id}.webp`]);
import professionalInstallation from "@/assets/mocks/editorial/solar-panels-f6b647281b36.webp";
import professionalRooftop from "@/assets/mocks/editorial/solar-panels-ad6d474c9b41.webp";

export const mockProfessionalBanners = [professionalInstallation, professionalRooftop];
