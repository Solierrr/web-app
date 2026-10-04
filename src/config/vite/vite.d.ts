/// <reference types="vite/client" />

import type AppMode from "@/config/vite/mode.enum";

interface ImportMetaEnv {
  readonly VITE_APP_MODE?: AppMode;
  readonly VITE_DEV_LOGIN_EMAIL?: string;
  readonly VITE_DEV_LOGIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
