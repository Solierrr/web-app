import "@testing-library/jest-dom";
import "@/config/i18n/internationalization";

// Node 25+ expõe um `localStorage` global sem os métodos de Storage quando não recebe
// `--localstorage-file`, e ele tapa o do jsdom (`localStorage.clear is not a function`).
// Quando o Storage do ambiente não é utilizável, usa o do próprio jsdom (que o vitest expõe em
// `globalThis.jsdom`) e, em último caso, um em memória com a mesma interface.
function createMemoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(String(key)) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(String(key));
    },
    setItem: (key, value) => {
      items.set(String(key), String(value));
    },
  };
}

const jsdomWindow = (globalThis as { jsdom?: { window?: Window } }).jsdom?.window;

for (const name of ["localStorage", "sessionStorage"] as const) {
  const candidates = [window[name], jsdomWindow?.[name]];
  const storage = candidates.find((item) => typeof item?.clear === "function") ?? createMemoryStorage();
  Object.defineProperty(globalThis, name, { configurable: true, value: storage });
}
