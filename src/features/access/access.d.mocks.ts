import type { AuthSession } from "./access";

export function createMockSession(email: string, userId = `mock:${email.trim().toLowerCase()}`): AuthSession {
  return {
    userId,
    email: email.trim().toLowerCase(),
    accessToken: `mock-access-${crypto.randomUUID()}`,
    refreshToken: `mock-refresh-${crypto.randomUUID()}`,
    accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    isMock: true,
  };
}
