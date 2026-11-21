import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { RUTAS, TEMAS, abrir, tamano } from "./comun";

// Reto: «0 violaciones de axe». A diferencia de las pruebas con jsdom, aquí axe corre en un
// navegador real: mide el contraste de verdad y revisa la página completa (landmarks, título,
// idioma, enlace para saltar), en las 4 paletas y en dos anchos.

for (const ruta of RUTAS) {
  for (const tema of TEMAS) {
    for (const ancho of [360, 1024]) {
      test(`${ruta.nombre} · ${tema.nombre} · ${ancho} px: 0 violaciones de axe`, async ({
        page,
      }) => {
        await page.setViewportSize(tamano(ancho));
        await page.emulateMedia(tema.media);
        await abrir(page, ruta);

        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();

        const detalle = violations
          .map(
            (v) =>
              `${v.id} (${v.impact}): ${v.help}\n   ${v.nodes.map((n) => n.target.join(" ")).join("\n   ")}`,
          )
          .join("\n");
        expect(violations, detalle).toEqual([]);
      });
    }
  }
}

test("con colores forzados de Windows los botones conservan un borde visible", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await abrir(page, RUTAS[0]);

  const borde = await page
    .getByRole("button", { name: "Simular" })
    .evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
  expect(borde).toBeGreaterThanOrEqual(2);
});

test("el color-scheme del navegador sigue al tema", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await abrir(page, RUTAS[0]);
  const fondoOscuro = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: "light" });
  const fondoClaro = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  expect(fondoOscuro).toBe("rgb(13, 16, 32)");
  expect(fondoClaro).toBe("rgb(244, 246, 251)");
});

test("las transiciones se apagan con «reducir movimiento» y existen sin esa preferencia", async ({
  page,
}) => {
  const duracion = () =>
    page
      .getByRole("button", { name: "Simular" })
      .evaluate((el) => getComputedStyle(el).transitionDuration);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await abrir(page, RUTAS[0]);
  // Son tres propiedades (fondo, borde y color): el navegador las devuelve separadas por comas.
  expect((await duracion()).split(", ")).toEqual(["0.15s", "0.15s", "0.15s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect((await duracion()).split(", ").every((d) => d === "0s")).toBe(true);
});
