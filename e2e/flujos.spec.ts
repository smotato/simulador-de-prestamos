import { expect, test } from "@playwright/test";
import { RUTAS, abrir, tamano } from "./comun";

// Flujos de usuario completos en un navegador real: teclado, URL compartible, CSV, portapapeles, historial.

test("«Saltar al contenido» es lo primero con Tab, se ve y mueve el foco al contenido", async ({
  page,
}) => {
  await abrir(page, RUTAS[0]);
  await page.keyboard.press("Tab");

  const saltar = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(saltar).toBeFocused();
  await expect(saltar).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("todo el formulario se usa solo con teclado y el foco siempre se ve", async ({ page }) => {
  await abrir(page, RUTAS[0]);
  await page.getByLabel("Monto del préstamo (COP)").focus();

  await page.keyboard.type("10.000.000");
  await page.keyboard.press("Tab");
  await page.keyboard.type("12,5");
  await page.keyboard.press("Tab");
  await page.keyboard.type("12");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown"); // sistema alemán
  await page.keyboard.press("Tab");

  const boton = page.getByRole("button", { name: "Simular" });
  await expect(boton).toBeFocused();
  const contorno = await boton.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(parseFloat(contorno)).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/monto=10000000&tasa=12\.5&plazo=12&sistema=aleman/);
  await expect(page.getByRole("status").first()).toContainText(
    "Simulación calculada: primera cuota de",
  );
});

test("enviar el formulario vacío deja el foco en el primer campo con error", async ({ page }) => {
  await abrir(page, RUTAS[0]);
  await page.getByRole("button", { name: "Simular" }).click();

  const monto = page.getByLabel("Monto del préstamo (COP)");
  await expect(monto).toBeFocused();
  await expect(monto).toHaveAttribute("aria-invalid", "true");
  await expect(monto).toHaveAccessibleDescription("Escriba el monto del préstamo en pesos.");
});

test("un plazo de 400 muestra el error junto al campo y no calcula", async ({ page }) => {
  await abrir(page, RUTAS[0]);
  await page.getByLabel("Monto del préstamo (COP)").fill("10000000");
  await page.getByLabel("Tasa efectiva anual (EA, %)").fill("12");
  await page.getByLabel("Plazo (meses)").fill("400");
  await page.getByRole("button", { name: "Simular" }).click();

  await expect(page.getByLabel("Plazo (meses)")).toBeFocused();
  await expect(page.getByText("El plazo debe estar entre 1 y 360 meses.")).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

test("los valores de referencia del enunciado salen en pantalla", async ({ page }) => {
  await page.goto("/?monto=10000000&tasa=12&plazo=12&sistema=frances");
  await expect(page.getByRole("table")).toBeVisible();

  await expect(page.getByText("Simulación calculada: cuota de")).toContainText("885.621");
  await expect(
    page.getByText("Total de intereses").locator("xpath=following-sibling::dd"),
  ).toContainText("627.448");
  const primera = page.getByRole("row").nth(1);
  await expect(primera).toContainText("885.621");
  await expect(primera).toContainText("94.888");
  await expect(primera).toContainText("9.209.267");
});

test("la tabla muestra solo 12 filas y se puede paginar con 360 cuotas", async ({ page }) => {
  await abrir(page, RUTAS[1]);

  await expect(page.getByRole("rowheader")).toHaveCount(12);
  await expect(page.getByText("Página 1 de 30")).toBeVisible();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByRole("table", { name: /cuotas 13 a 24 de 360/i })).toBeVisible();
  await expect(page.getByRole("rowheader")).toHaveCount(12);
});

test("el enlace copiado abre la misma simulación en otra pestaña (criterio 4)", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await abrir(page, RUTAS[1]);

  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByText("Enlace copiado al portapapeles.")).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toBe(page.url());

  const otra = await context.newPage();
  await otra.goto(copiado);
  await expect(otra.getByRole("table")).toBeVisible();
  await expect(otra.getByLabel("Monto del préstamo (COP)")).toHaveValue("10000000");
  await expect(otra.getByLabel("Plazo (meses)")).toHaveValue("360");
});

test("«Descargar CSV» baja un archivo con ; como separador y BOM", async ({ page }) => {
  await page.goto("/?monto=10000000&tasa=12&plazo=12&sistema=frances");
  await expect(page.getByRole("table")).toBeVisible();

  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar CSV" }).click();
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toBe("amortizacion-frances.csv");

  const ruta = await archivo.path();
  const { readFileSync } = await import("node:fs");
  const bytes = readFileSync(ruta);
  expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  const lineas = bytes.toString("utf8").replace(/^﻿/, "").split("\r\n");
  expect(lineas[0]).toBe("Cuota n.º;Cuota;Intereses;Abono a capital;Saldo");
  expect(lineas[1]).toBe("1;885621;94888;790733;9209267");
  expect(lineas).toHaveLength(14);
});

test("con una URL inválida la página no se rompe y no hay errores en consola", async ({ page }) => {
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(e.message));
  page.on("console", (m) => m.type() === "error" && errores.push(m.text()));

  await page.goto("/?monto=abc");
  await expect(page.getByLabel("Monto del préstamo (COP)")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("table")).toHaveCount(0);
  expect(errores).toEqual([]);
});

test("el historial guarda las simulaciones, permite repetirlas y borrarlas", async ({ page }) => {
  await page.goto("/?monto=10000000&tasa=12&plazo=12&sistema=frances");
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/?monto=5000000&tasa=9.5&plazo=24&sistema=aleman");
  await expect(page.getByRole("table")).toBeVisible();

  await page.getByRole("link", { name: "Historial" }).click();
  // Solo los del contenido: el menú de navegación también usa <li>.
  const items = page.getByRole("main").getByRole("listitem");
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText("5.000.000");

  await items
    .nth(1)
    .getByRole("link", { name: /repetir/i })
    .click();
  await expect(page).toHaveURL(/monto=10000000/);
  await expect(page.getByRole("table")).toBeVisible();

  await page.getByRole("link", { name: "Historial" }).click();
  await page.getByRole("button", { name: "Borrar historial" }).click();
  await expect(page.getByText("Aún no hay simulaciones guardadas.")).toBeFocused();
});

test("el menú es navegable y marca la página actual", async ({ page }) => {
  await page.setViewportSize(tamano(360));
  await abrir(page, RUTAS[0]);

  const actual = page.getByRole("link", { name: "Simulador" });
  await expect(actual).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Comparar" }).click();
  await expect(page).toHaveURL(/\/comparar$/);
  await expect(page).toHaveTitle("Comparar sistemas · Simulador de préstamos");
  await expect(page.getByRole("link", { name: "Comparar" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("cada página tiene un título propio y un solo h1", async ({ page }) => {
  const titulos = new Set<string>();
  for (const ruta of RUTAS.filter(
    (r) => !["resultado", "errores", "historial"].includes(r.nombre),
  )) {
    await abrir(page, ruta);
    titulos.add(await page.title());
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
  expect(titulos.size).toBe(4); // inicio, comparar, historial, 404
});
