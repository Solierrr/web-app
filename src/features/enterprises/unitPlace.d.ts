import type { Address } from '@/shared/types/address/address';
import type { Enterprise } from './enterprise';

export interface unitPlace {
    id: string;
    name: string;
    enterprise: Enterprise;
    address: Address;
    geolocation: Geolocation;
}