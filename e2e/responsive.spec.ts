import { expect, test } from "@playwright/test";
import { ANCHOS, RUTAS, abrir, tamano } from "./comun";

// Reto: «sin scroll horizontal en 360/768/1024». Se mide en un navegador real, en cada página.

for (const ruta of RUTAS) {
  for (const ancho of ANCHOS) {
    test(`${ruta.nombre} · ${ancho} px: la página no se desplaza horizontalmente`, async ({
      page,
    }) => {
      await page.setViewportSize(tamano(ancho));
      await abrir(page, ruta);

      const exceso = await page.evaluate(() => ({
        pagina: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cuerpo: document.body.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(exceso.pagina, "desborda <html>").toBeLessThanOrEqual(0);
      expect(exceso.cuerpo, "desborda <body>").toBeLessThanOrEqual(0);
    });
  }
}

test("a 360 px solo la tabla se desplaza, dentro de su recuadro", async ({ page }) => {
  await page.setViewportSize(tamano(360));
  await abrir(page, RUTAS[1]);

  const recuadro = page.getByRole("region", { name: /se desplaza horizontalmente/i });
  const medidas = await recuadro.evaluate((el) => ({
    desborda: el.scrollWidth > el.clientWidth,
    ancho: el.getBoundingClientRect().width,
  }));
  expect(medidas.desborda).toBe(true);
  expect(medidas.ancho).toBeLessThanOrEqual(360);
  // Y el recuadro se alcanza con el teclado.
  await recuadro.focus();
  await expect(recuadro).toBeFocused();
});

test("el formulario cambia de 1 a 2 columnas, y a 1024 px queda junto al resumen", async ({
  page,
}) => {
  const campo = (nombre: string) => page.getByLabel(nombre);
  const caja = async (nombre: string) => (await campo(nombre).boundingBox())!;

  await page.setViewportSize(tamano(360));
  await abrir(page, RUTAS[1]);
  const [a360, b360] = [
    await caja("Monto del préstamo (COP)"),
    await caja("Tasa efectiva anual (EA, %)"),
  ];
  expect(b360.y, "360 px: una columna").toBeGreaterThan(a360.y + a360.height - 1);

  await page.setViewportSize(tamano(768));
  const [a768, b768] = [
    await caja("Monto del préstamo (COP)"),
    await caja("Tasa efectiva anual (EA, %)"),
  ];
  expect(Math.abs(a768.y - b768.y), "768 px: dos columnas").toBeLessThan(2);

  await page.setViewportSize(tamano(1024));
  const formulario = await page.getByRole("button", { name: "Simular" }).boundingBox();
  const resumen = await page.getByRole("heading", { name: "Resultado" }).boundingBox();
  expect(resumen!.x, "1024 px: el resumen queda a la derecha del formulario").toBeGreaterThan(
    formulario!.x + 100,
  );
});

test("los botones y enlaces principales miden al menos 44×44 px en móvil", async ({ page }) => {
  await page.setViewportSize(tamano(360));
  await abrir(page, RUTAS[1]);

  const objetivos = page.locator("main button, nav a, main a");
  const cantidad = await objetivos.count();
  expect(cantidad).toBeGreaterThan(3);
  for (let i = 0; i < cantidad; i++) {
    const caja = await objetivos.nth(i).boundingBox();
    if (!caja) continue;
    const nombre = (await objetivos.nth(i).innerText()).trim();
    expect(caja.height, `alto de «${nombre}»`).toBeGreaterThanOrEqual(43.5);
  }
});

test("el texto base mide al menos 16 px", async ({ page }) => {
  await page.setViewportSize(tamano(360));
  await abrir(page, RUTAS[0]);
  const tamanoTexto = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.body).fontSize),
  );
  expect(tamanoTexto).toBeGreaterThanOrEqual(16);
});

test("a 1024 px el formulario no invade la columna del resumen", async ({ page }) => {
  await page.setViewportSize(tamano(1024));
  await abrir(page, RUTAS[1]);

  const resumen = await page.getByRole("heading", { name: "Resultado" }).boundingBox();
  for (const nombre of [
    "Monto del préstamo (COP)",
    "Tasa efectiva anual (EA, %)",
    "Plazo (meses)",
    "Sistema de pago",
  ]) {
    const campo = (await page.getByLabel(nombre).boundingBox())!;
    expect(campo.x + campo.width, `«${nombre}» se sale de su columna`).toBeLessThanOrEqual(
      resumen!.x,
    );
  }
});

test("a 768 px los campos del formulario no se montan entre sí", async ({ page }) => {
  await page.setViewportSize(tamano(768));
  await abrir(page, RUTAS[1]);

  const monto = (await page.getByLabel("Monto del préstamo (COP)").boundingBox())!;
  const tasa = (await page.getByLabel("Tasa efectiva anual (EA, %)").boundingBox())!;
  expect(monto.x + monto.width).toBeLessThanOrEqual(tasa.x);
});
