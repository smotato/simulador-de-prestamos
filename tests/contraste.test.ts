import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// WCAG 1.4.3: texto normal ≥ 4,5:1 (AA).  WCAG 1.4.6: ≥ 7:1 (AAA) en las paletas de alto contraste.
// WCAG 1.4.11: bordes de controles y foco ≥ 3:1 (≥ 4,5:1 en alto contraste).
// Los colores se leen de src/app/globals.css: si alguien los cambia y rompe el contraste en
// cualquiera de las cuatro paletas (clara, oscura, clara+alto contraste, oscura+alto contraste),
// esta prueba falla.

const css = readFileSync(resolve(__dirname, "../src/app/globals.css"), "utf8");

function leerColores(bloque: string): Record<string, string> {
  const colores: Record<string, string> = {};
  for (const [, nombre, valor] of bloque.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    colores[nombre] = valor;
  }
  return colores;
}

/** Variables de `:root` fuera de cualquier @media. */
const base = leerColores(css.match(/^:root\s*\{([^}]*)\}/m)![1]);

/** Variables de `@media (<condición>) { :root { … } }`. Falla si la condición no existe. */
function enMedia(condicion: string): Record<string, string> {
  for (const [, cond, cuerpo] of css.matchAll(
    /@media\s*([^{]+?)\s*\{\s*:root\s*\{([^}]*)\}\s*\}/g,
  )) {
    if (cond === condicion) return leerColores(cuerpo);
  }
  throw new Error(`No se encontró @media ${condicion} en globals.css`);
}

const oscuroEnCss = enMedia("(prefers-color-scheme: dark)");
const masContrasteEnCss = enMedia("(prefers-contrast: more)");
const oscuroMasContrasteEnCss = enMedia(
  "(prefers-color-scheme: dark) and (prefers-contrast: more)",
);

// Se aplican en el mismo orden que en el CSS: el último bloque que coincide gana.
const PALETAS = {
  claro: base,
  oscuro: { ...base, ...oscuroEnCss },
  "claro + alto contraste": { ...base, ...masContrasteEnCss },
  "oscuro + alto contraste": {
    ...base,
    ...oscuroEnCss,
    ...masContrasteEnCss,
    ...oscuroMasContrasteEnCss,
  },
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

/** En alto contraste el texto debe llegar a AAA (7:1) y los bordes a 4,5:1. */
function minimoPara(paleta: string, minimo: number): number {
  if (!paleta.includes("alto contraste")) return minimo;
  return minimo >= 4.5 ? 7 : 4.5;
}

describe.each(Object.entries(PALETAS))("contraste · %s", (nombre, colores) => {
  it("define los 9 colores", () => {
    expect(Object.keys(colores).sort()).toEqual(Object.keys(base).sort());
    expect(Object.keys(colores)).toHaveLength(9);
  });

  it.each(PARES)("%s sobre %s ≥ %s:1 (%s)", (primerPlano, fondo, minimo) => {
    const exigido = minimoPara(nombre, minimo);
    const razon = contraste(colores[primerPlano], colores[fondo]);
    expect(
      razon,
      `${primerPlano} ${colores[primerPlano]} sobre ${fondo} ${colores[fondo]} = ${razon.toFixed(2)}:1, se exige ${exigido}:1`,
    ).toBeGreaterThanOrEqual(exigido);
  });
});

describe("las paletas son distintas entre sí", () => {
  it("cada una cambia el fondo o el texto respecto a la clara", () => {
    const { claro, ...otras } = PALETAS;
    for (const [nombre, paleta] of Object.entries(otras)) {
      const igual = paleta.fondo === claro.fondo && paleta.texto === claro.texto;
      // La clara con alto contraste conserva el fondo blanco pero cambia el texto a negro puro.
      expect(igual, nombre).toBe(false);
    }
  });

  it("el alto contraste es de verdad más contrastado que su paleta normal", () => {
    const c = (p: Record<string, string>) => contraste(p["texto-suave"], p.fondo);
    expect(c(PALETAS["claro + alto contraste"])).toBeGreaterThan(c(PALETAS.claro));
    expect(c(PALETAS["oscuro + alto contraste"])).toBeGreaterThan(c(PALETAS.oscuro));
  });
});

describe("contraste · la fórmula", () => {
  it("negro sobre blanco da 21:1", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("detecta un gris que no llega a 4,5:1 (#777 sobre blanco ≈ 4,48)", () => {
    expect(contraste("#777777", "#ffffff")).toBeLessThan(4.5);
  });
});
