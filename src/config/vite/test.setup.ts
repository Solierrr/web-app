import "@testing-library/jest-dom";
import "@/config/i18n/internationalization";

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: window.localStorage });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: window.sessionStorage });
