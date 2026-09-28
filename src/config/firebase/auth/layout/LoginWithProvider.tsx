import { FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { loginWithGoogle } from "../auth.service";

export type LoginProvider = "google" | "microsoft";

interface LoginWithProviderProps {
  onMockLogin?: () => Promise<void>;
}

const classes = "flex w-fit h-fit aspect-square cursor-pointer";

async function handleLogin(onMockLogin: LoginWithProviderProps["onMockLogin"]) {
  try {
    if (isAlwaysMockMode()) {
      await onMockLogin?.();
      return;
    }

    await loginWithGoogle();
  } catch (error) {
    console.error(error);
  }
}

export function LoginWithGoogle({ onMockLogin }: LoginWithProviderProps) {
  return (
    <button type="button" className={classes} aria-label="Continue with Google" onClick={() => handleLogin(onMockLogin)}>
      <FcGoogle size="40" />
    </button>
  );
}

export function LoginWithMicrosoft({ onMockLogin }: LoginWithProviderProps) {
  return (
    <button type="button" className={classes} aria-label="Continue with Microsoft" onClick={() => handleLogin(onMockLogin)}>
      <FaMicrosoft size="40" />
    </button>
  );
}
