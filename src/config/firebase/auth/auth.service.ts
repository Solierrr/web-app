import {
    GoogleAuthProvider,
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

const googleProvider = new GoogleAuthProvider();

export function register(email: string, password: string) {
    return createUserWithEmailAndPassword(
        auth,
        email,
        password,
    );
}

export function login(email: string, password: string) {
    return signInWithEmailAndPassword(
        auth,
        email,
        password,
    );
}

export function logout() {
    return signOut(auth);
}

export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

export function getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
}

export async function reloadCurrentFirebaseUser(): Promise<User | null> {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    return auth.currentUser;
}

export function sendVerificationEmail(user: User) {
    return sendEmailVerification(user);
}

export function requestPasswordReset(email: string) {
    return sendPasswordResetEmail(auth, email);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("Nenhuma sessão do Firebase disponível");
    await signInWithEmailAndPassword(auth, user.email, currentPassword);
    await updatePassword(user, newPassword);
}