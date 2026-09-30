/// <reference types="vite/client" />

import type AppMode from "@/config/vite/mode.enum";

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: AppMode;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
