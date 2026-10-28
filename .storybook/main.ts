import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { chromeTokens } from "./theme.ts";

const config: StorybookConfig = {
  managerHead: (head) => `${head}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root { ${Object.entries(chromeTokens).map(([name, value]) => `--solaria-${name}: ${value};`).join("\n")} }
      ${readFileSync(new URL("./manager.css", import.meta.url), "utf8")}
    </style>`,
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@chromatic-com/storybook", "@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-mcp"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...new Set([
          ...(config.optimizeDeps?.include ?? []),
          "react-pdf",
          "@stomp/stompjs",
          "firebase/app",
          "firebase/auth",
          "docx-preview",
          "echarts/core",
          "echarts/charts",
          "echarts/components",
          "echarts/renderers",
        ]),
      ],
    };
    const modules = {
      "@/lib/shared/context/ActiveContext": "ActiveContext.tsx",
      "@/lib/shared/auth/authToken.utils": "authToken.utils.ts",
      "@/features/access/access.service": "access.service.ts",
      "@/config/mocks/mockMode.utils": "mockMode.utils.ts",
      "@/features/dashboard/dashboard.hooks": "dashboard.hooks.ts",
    };
    const mocks = Object.entries(modules).flatMap(([source, file]) => [
      { find: source, replacement: fileURLToPath(new URL(`./mocks/${file}`, import.meta.url)) },
      {
        find: fileURLToPath(new URL(`../src/${source.slice(2)}`, import.meta.url)),
        replacement: fileURLToPath(new URL(`./mocks/${file}`, import.meta.url)),
      },
    ]);
    const aliases = config.resolve?.alias ?? [];
    config.resolve = {
      ...config.resolve,
      alias: [...mocks, ...(Array.isArray(aliases) ? aliases : Object.entries(aliases).map(([find, replacement]) => ({ find, replacement })))],
    };
    return config;
  },
};
export default config;
