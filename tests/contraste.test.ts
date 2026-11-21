import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// WCAG 1.4.3: texto normal ≥ 4,5:1.  WCAG 1.4.11: bordes de controles y foco ≥ 3:1.
// Los colores se leen de src/app/globals.css, así que si alguien los cambia y rompe el
// contraste en el tema claro o en el oscuro, esta prueba falla.

const css = readFileSync(resolve(__dirname, "../src/app/globals.css"), "utf8");

function leerColores(bloque: string): Record<string, string> {
  const colores: Record<string, string> = {};
  for (const [, nombre, valor] of bloque.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    colores[nombre] = valor;
  }
  return colores;
}

const claro = leerColores(css.match(/:root\s*\{([^}]*)\}/)![1]);
const oscuro = {
  ...claro,
  ...leerColores(css.match(/prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/)![1]),
};

function luminancia(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
  const [clara, oscura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (clara + 0.05) / (oscura + 0.05);
}

/** [color del primer plano, color del fondo, mínimo exigido, dónde se usa] */
const PARES: [string, string, number, string][] = [
  ["texto", "fondo", 4.5, "texto general"],
  ["texto", "fondo-campo", 4.5, "texto escrito en los campos"],
  ["texto-suave", "fondo", 4.5, "ayudas, fechas y botones deshabilitados"],
  ["texto-suave", "fondo-campo", 4.5, "encabezados de tabla"],
  ["acento", "fondo", 4.5, "enlaces y botones con borde"],
  ["texto-boton", "acento", 4.5, "texto de los botones"],
  ["texto-boton", "acento-hover", 4.5, "botones al pasar el cursor"],
  ["error", "fondo", 4.5, "mensajes de error"],
  ["borde", "fondo", 3, "borde de campos y tablas"],
  ["borde", "fondo-campo", 3, "borde de los campos"],
  ["acento", "fondo", 3, "indicador de foco"],
];

describe.each([
  ["tema claro", claro],
  ["tema oscuro", oscuro],
])("contraste · %s", (_, colores) => {
  it.each(PARES)("%s sobre %s ≥ %s:1 (%s)", (primerPlano, fondo, minimo) => {
    const razon = contraste(colores[primerPlano], colores[fondo]);
    expect(
      razon,
      `${primerPlano} ${colores[primerPlano]} sobre ${fondo} ${colores[fondo]}`,
    ).toBeGreaterThanOrEqual(minimo);
  });
});

describe("contraste · la fórmula", () => {
  it("negro sobre blanco da 21:1", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("detecta un gris que no llega a 4,5:1 (#777 sobre blanco ≈ 4,48)", () => {
    expect(contraste("#777777", "#ffffff")).toBeLessThan(4.5);
  });

  it("lee las dos paletas de globals.css", () => {
    expect(claro.fondo).toBe("#ffffff");
    expect(oscuro.fondo).not.toBe(claro.fondo);
  });
});
