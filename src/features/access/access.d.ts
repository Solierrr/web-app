export interface Access {
    id:    string;
    name:  string;
    email: string;
}

export interface LoginCredentials {
    email:    string;
    password: string;
}

export interface LoginResponse {
    access: Access;
    token:  string;
}

export interface RegisterCredentials {
    loginCredentials: LoginCredentials;
    accessToken: number;
}

export interface AuthState {
    access: Access | null;
    token:  string | null;
    authenticated: boolean;
}