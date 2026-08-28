import type { Contact } from '@/shared/types/contact/contact';
import type { Address } from '@/shared/types/address/address';

export interface Enterprise {
    id: string;
    name: string;
    cnpj: string;
    enterpriseEmail: string;
    contact: Contact;
    centerUnityAddress: Address;
    geolocation: Geolocation;
}