import { test } from "@playwright/test";
import { RUTAS, abrir, tamano } from "./comun";

// Genera las capturas de evidencia (calidad/capturas/<página>-<ancho>.png) en 360, 768 y 1024 px.
// Se ejecuta aparte: npm run e2e:capturas

const PAGINAS = ["inicio", "resultado", "errores", "comparar", "historial"];

for (const nombre of PAGINAS) {
  const ruta = RUTAS.find((r) => r.nombre === nombre)!;
  for (const ancho of [360, 768, 1024]) {
    test(`captura ${nombre} · ${ancho} px`, async ({ page }) => {
      await page.setViewportSize(tamano(ancho));
      await abrir(page, ruta);
      await page.screenshot({
        path: `calidad/capturas/${nombre}-${ancho}.png`,
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}

// Evidencia del modo oscuro y del alto contraste (reto «modo oscuro y alto contraste»).
const TEMAS_VISUALES = [
  { nombre: "oscuro", media: { colorScheme: "dark", contrast: "no-preference" } },
  { nombre: "alto-contraste", media: { colorScheme: "light", contrast: "more" } },
] as const;

for (const tema of TEMAS_VISUALES) {
  for (const nombre of ["resultado", "comparar"]) {
    const ruta = RUTAS.find((r) => r.nombre === nombre)!;
    for (const ancho of [360, 1024]) {
      test(`captura ${nombre} · ${tema.nombre} · ${ancho} px`, async ({ page }) => {
        await page.setViewportSize(tamano(ancho));
        await page.emulateMedia(tema.media);
        await abrir(page, ruta);
        await page.screenshot({
          path: `calidad/capturas/${nombre}-${tema.nombre}-${ancho}.png`,
          fullPage: true,
          animations: "disabled",
        });
      });
    }
  }
}
