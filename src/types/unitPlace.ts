import type { Address } from './shared/address';
import type { Enterprise } from './enterprise';

export interface unitPlace {
    id: string;
    name: string;
    enterprise: Enterprise;
    address: Address;
    geolocation: Geolocation;
}