import type { Contact } from '@/shared/types/contact/contact';
import type { Address } from '@/shared/types/address/address';
import type { Geolocalization } from '@/shared/types/geolocation/geolocalization';
import type { TechnicalAffiliationType } from './professional.enum';

// Corresponde a `professional_registration` + `profession` no schema-api-core.sql.
export interface ProfessionalRegistration {
    profession:     string;
    council:        string;
    number:         string;
    expirationDate: string;
}

// Corresponde a `technician` + `person` (+ `technician_affiliation`,
// `professional_registration`, `profession`) no schema-api-core.sql.
export interface Professional {
    id:               string;
    name:             string;

    // NOTE: não existe coluna equivalente em `technician`/`person`; só seria
    // alcançável via `person.fk_users -> users.avatar`. Mantido como mock até
    // esse join existir na API.
    avatar?:          string;

    contact:          Contact;
    address:          Address;
    geolocation:      Geolocalization;
    affiliationType?: TechnicalAffiliationType;
    registrations?:   ProfessionalRegistration[];

    // NOTE: também não existe coluna de slug em `technician`/`person` no
    // schema-api-core.sql. Usado para montar URLs amigáveis (ex.:
    // /profissional/{slug}) até existir essa coluna (ou geração equivalente)
    // na API.
    slug:             string;
}
