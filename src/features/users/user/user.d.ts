import type { Contact } from '@/shared/types/contact/contact';

export interface User {
    id: string;
    authId: string;
    avatar?: string;
    active: boolean;
    name: string;
    cpf: string;
    birthDate: string;
    contact?: Contact;
}
