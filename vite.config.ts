/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = import.meta.dirname;

const MOCK_FLAGS = ["VITE_MOCKS", "VITE_AUTH_MOCKS", "VITE_MESSENGER_MOCKS", "VITE_AI_MOCKS"];

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const productionBuild = command === "build";
  return {
  define: productionBuild ? Object.fromEntries(MOCK_FLAGS.map((flag) => [`import.meta.env.${flag}`, JSON.stringify("DEACTIVATED")])) : {},
  plugins: [react(), tailwindcss(), babel({
    presets: [reactCompilerPreset()]
  })],
  server: {
    proxy: {
      '/local-api/core': { target: env.VITE_LOCAL_API_CORE_TARGET ?? 'http://localhost:8080', changeOrigin: true, headers: { Origin: 'http://localhost:5173' }, rewrite: (url) => url.replace(/^\/local-api\/core/, '') },
      '/local-api/auth': { target: 'http://localhost:8081', changeOrigin: true, headers: { Origin: 'http://localhost:5173' }, rewrite: (url) => url.replace(/^\/local-api\/auth/, '') }
    }
  },
  resolve: {
    alias: {
      '@@': fileURLToPath(new URL('./src/lib/components', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage'
    },
    projects: [{
      extends: true,
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/config/vite/test.setup.ts'
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
};
});
