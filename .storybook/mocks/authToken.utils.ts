import type { AuthSession } from "../../src/features/access/access";
const fixture: AuthSession = {
  accessToken: "storybook-local",
  refreshToken: "storybook-local",
  accessTokenExpiresAt: "2099-01-01T00:00:00Z",
  userId: "storybook-auth",
  email: "ana@solaria.test",
  isMock: true,
};
export function getAuthSession() {
  return fixture;
}
export function setAuthSession() {
  /* Stories do not persist authentication. */
}
export function clearAuthSession() {
  /* Stories do not clear the app session. */
}
