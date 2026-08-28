import type { Contact } from '@/shared/types/contact/contact';
import type { Address } from '@/shared/types/address/address';

export interface Professional {
    id:          string;
    name:        string;
    contact:     Contact;
    address:     Address;
    geolocation: Geolocation;
}