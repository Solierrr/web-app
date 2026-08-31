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

    // NOTE: `users` só tem a coluna `avatar` em schema-api-core.sql, sem banner.
    // Mantido como mock até existir campo equivalente na API.
    bannerUrl?: string;
}
