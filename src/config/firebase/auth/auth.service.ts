import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
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