import type { Contact } from "@/shared/types/contact/contact";
import type { Address } from "@/shared/types/address/address";
import type { Geolocalization } from "@/shared/types/geolocation/geolocalization";

export interface Enterprise {
  id: string;
  name: string;
  cnpj: string;
  enterpriseEmail: string;
  contact: Contact;
  centerUnityAddress: Address;
  geolocation: Geolocalization;
}

export interface unitPlace {
  id: string;
  name: string;
  enterprise: Enterprise;
  address: Address;
  geolocation: Geolocalization;
}
