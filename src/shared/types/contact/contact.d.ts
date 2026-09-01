export interface Contact {
  number?: string;
  email: string;
  socialMedia?: {
    whatsapp?: boolean;
    facebook?: boolean;
    instagram?: boolean;
    linkedin?: boolean;
  };
}
