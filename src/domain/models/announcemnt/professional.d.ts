import type { Contact } from '../shared/contact';
import type { Address } from '../shared/address';

export interface Professional {
    id:          string;
    name:        string;
    contact:     Contact;
    address:     Address;
    geolocation: Geolocation;
}