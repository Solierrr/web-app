import {
  GoogleAuthProvider,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updatePassword,
  type User,
} from "firebase/auth";

import { auth } from "../firebase";
import i18n from "@/config/i18n/internationalization";
import { createServiceError } from "@/config/logging/serviceError.utils";

const googleProvider = new GoogleAuthProvider();

async function runAuthOperation<T>(operation: string, request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (cause) {
    throw createServiceError("firebaseAuth", operation, i18n.t(`services:firebaseAuth.${operation}`), cause);
  }
}

export function register(email: string, password: string) {
  return runAuthOperation("register", () => createUserWithEmailAndPassword(auth, email, password));
}

export function login(email: string, password: string) {
  return runAuthOperation("login", () => signInWithEmailAndPassword(auth, email, password));
}

export function logout() {
  return runAuthOperation("logout", () => signOut(auth));
}

export async function loginWithGoogle() {
  const result = await runAuthOperation("loginWithGoogle", () => signInWithPopup(auth, googleProvider));
  return result.user;
}

export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

export async function reloadCurrentFirebaseUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;
  await runAuthOperation("reloadCurrentFirebaseUser", () => reload(user));
  return auth.currentUser;
}

export function sendVerificationEmail(user: User) {
  return runAuthOperation("sendVerificationEmail", () => sendEmailVerification(user));
}

export function requestPasswordReset(email: string) {
  return runAuthOperation("requestPasswordReset", () => sendPasswordResetEmail(auth, email));
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw createServiceError("firebaseAuth", "changePassword", i18n.t("services:firebaseAuth.sessionUnavailable"));
  const email = user.email;
  await runAuthOperation("changePassword", async () => {
    await signInWithEmailAndPassword(auth, email, currentPassword);
    await updatePassword(user, newPassword);
  });
}

export function completePasswordReset(code: string, newPassword: string) {
  return runAuthOperation("completePasswordReset", () => confirmPasswordReset(auth, code, newPassword));
}
