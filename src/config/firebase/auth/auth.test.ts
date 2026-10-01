import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, createUserMock, signInMock, reloadMock, updatePasswordMock, signOutMock } = vi.hoisted(() => ({
  authMock: { currentUser: null as unknown },
  createUserMock: vi.fn(),
  signInMock: vi.fn(),
  reloadMock: vi.fn(),
  updatePasswordMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class {},
  createUserWithEmailAndPassword: createUserMock,
  signInWithEmailAndPassword: signInMock,
  signInWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  reload: reloadMock,
  updatePassword: updatePasswordMock,
  signOut: signOutMock,
}));

vi.mock("../firebase", () => ({ auth: authMock }));

import { changePassword, getCurrentFirebaseUser, login, logout, register, reloadCurrentFirebaseUser } from "./auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.currentUser = null;
  });

  it("registers and logs in with email and password against the firebase auth instance", async () => {
    await register("user@example.com", "secret");
    await login("user@example.com", "secret");

    expect(createUserMock).toHaveBeenCalledWith(authMock, "user@example.com", "secret");
    expect(signInMock).toHaveBeenCalledWith(authMock, "user@example.com", "secret");
  });

  it("signs the user out", async () => {
    await logout();

    expect(signOutMock).toHaveBeenCalledWith(authMock);
  });

  it("returns no user when there is no current firebase session", async () => {
    expect(getCurrentFirebaseUser()).toBeNull();
    await expect(reloadCurrentFirebaseUser()).resolves.toBeNull();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("reloads and returns the current firebase user", async () => {
    const user = { email: "user@example.com" };
    authMock.currentUser = user;

    await expect(reloadCurrentFirebaseUser()).resolves.toBe(user);
    expect(reloadMock).toHaveBeenCalledWith(user);
  });

  it("refuses to change the password without a firebase session", async () => {
    await expect(changePassword("old", "new")).rejects.toThrow("Nenhuma sessão do Firebase disponível");
    expect(updatePasswordMock).not.toHaveBeenCalled();
  });

  it("signs in with the current password before updating it", async () => {
    const user = { email: "user@example.com" };
    authMock.currentUser = user;

    await changePassword("old", "new");

    expect(signInMock).toHaveBeenCalledWith(authMock, "user@example.com", "old");
    expect(updatePasswordMock).toHaveBeenCalledWith(user, "new");
  });
});
