import { getSelectedContext } from "@/features/access/access.onboarding.service";
import type { Address, AddressPayload, LocalUnit, UnitPayload } from "./unit.service";

export function getMockUnits(companyId: string): LocalUnit[] {
  try {
    const saved = localStorage.getItem(`solaria.mock.units.${companyId}`);
    if (saved) return JSON.parse(saved);
  } catch {
    return [];
  }
  return [
    {
      id: `${companyId}:unit`,
      requesterId: companyId,
      address: {
        id: "mock-address",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Centro",
        zipCode: "01001000",
        street: "Praça da Sé",
        number: "1",
      },
      complement: null,
      locationType: "BUILDING",
    },
  ];
}

export function saveMockAddress(payload: AddressPayload): { id: string } {
  const id: string = crypto.randomUUID();
  const address: Address = { ...payload, id, neighborhood: payload.neighborhood ?? null, number: payload.number ?? null };
  localStorage.setItem(`solaria.mock.address.${id}`, JSON.stringify(address));
  return { id };
}

export function saveMockUnit(payload: UnitPayload, id: string = crypto.randomUUID()): LocalUnit {
  const companyId = getSelectedContext() ?? payload.requesterId;
  const items = getMockUnits(companyId);
  const existing = items.find((item) => item.id === id);
  const raw = payload.addressId ? localStorage.getItem(`solaria.mock.address.${payload.addressId}`) : null;
  const address: Address | null = raw ? JSON.parse(raw) : (existing?.address ?? null);
  const unit: LocalUnit = {
    id,
    requesterId: payload.requesterId,
    address,
    complement: payload.complement ?? null,
    locationType: payload.locationType,
  };
  localStorage.setItem(`solaria.mock.units.${companyId}`, JSON.stringify([...items.filter((item) => item.id !== id), unit]));
  return unit;
}

export function deleteMockUnit(id: string): void {
  const companyId = getSelectedContext() ?? "mock-company";
  localStorage.setItem(`solaria.mock.units.${companyId}`, JSON.stringify(getMockUnits(companyId).filter((item) => item.id !== id)));
}
