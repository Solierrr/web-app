const productImages = import.meta.glob<string>("/src/assets/mocks/products/*.webp", { eager: true, query: "?url", import: "default" });
const companyBanners = import.meta.glob<string>("/src/assets/mocks/banners/*.webp", { eager: true, query: "?url", import: "default" });

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
