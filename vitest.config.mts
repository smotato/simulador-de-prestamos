import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    // Las pruebas de e2e/ son de Playwright, no de Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
