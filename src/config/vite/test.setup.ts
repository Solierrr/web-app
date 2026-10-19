import "@testing-library/jest-dom";
import "@/config/i18n/internationalization";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn((media: string) => ({
    matches: false,
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })),
});

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: window.localStorage });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: window.sessionStorage });
