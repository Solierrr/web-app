import type { Contact } from './shared/contact';
import type { Address } from './shared/address';

export interface Enterprise {
    id: string;
    name: string;
    cnpj: string;
    enterpriseEmail: string;
    contact: Contact;
    centerUnityAddress: Address;
    geolocation: Geolocation;
}