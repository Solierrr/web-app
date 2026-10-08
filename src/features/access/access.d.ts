export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  email: string;
  sessionId?: string;
  clientId?: string;
  context?: string;
  isMock?: boolean;
  managedByCompany?: { id: string; name: string };
}

export interface RegisterResult {
  id: string;
  email: string;
  message: string;
}
