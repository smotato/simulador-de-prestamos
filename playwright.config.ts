import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

// Pruebas en un navegador real (Chromium) contra la versión de producción de la app:
//   npm run test:e2e          → pruebas de layout, accesibilidad y flujos
//   npm run e2e:capturas      → además guarda las capturas en calidad/capturas/
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: "es-CO",
    trace: "retain-on-failure",
  },
  webServer: {
    // Necesita `npm run build` antes (el script test:e2e ya lo hace).
    command: `npm run start -- --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /capturas\.spec\.ts/ },
    {
      name: "capturas",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /capturas\.spec\.ts/,
    },
  ],
});
