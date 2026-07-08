export interface Access {
    id: string;
    name: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse { // Resposta para API
    access: Access;
    token: string;
}

export interface AuthState {
    access: Access | null;
    token: string | null;
    authenticated: boolean;
}