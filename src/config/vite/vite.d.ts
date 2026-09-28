/// <reference types="vite/client" />

import type AppMode from "@/config/vite/mode.enum";
import type MocksMode from "@/config/mocks/mocksMode.enum";

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: AppMode;
  readonly VITE_MOCKS?: MocksMode;
  readonly VITE_MOCKS_DELAY_SECONDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
