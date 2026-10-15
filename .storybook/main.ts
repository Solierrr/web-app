import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
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
          "firebase/firestore",
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
