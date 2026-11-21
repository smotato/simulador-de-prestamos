import axe from "axe-core";

/**
 * Reglas de la página completa que no tienen sentido al probar un componente suelto
 * (el componente no trae <html>, <title> ni el <main> del layout).
 * Cuando una página real se mide con Lighthouse y axe DevTools, esas reglas sí se revisan.
 */
const REGLAS_DE_PAGINA = [
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "bypass",
  "document-title",
  "html-has-lang",
];

/** Contraste: jsdom no calcula estilos reales, así que lo cubre tests/contraste.test.ts. */
const REGLAS_NO_VERIFICABLES = ["color-contrast"];

export async function revisarAccesibilidad(contenedor: Element) {
  const apagadas = [...REGLAS_DE_PAGINA, ...REGLAS_NO_VERIFICABLES];
  const resultado = await axe.run(contenedor, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
    },
    rules: Object.fromEntries(apagadas.map((id) => [id, { enabled: false }])),
  });
  return resultado.violations;
}

/** Texto legible de las violaciones, para que el fallo de la prueba diga qué arreglar. */
export function describir(violaciones: Awaited<ReturnType<typeof revisarAccesibilidad>>): string {
  return violaciones
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`)
    .join("\n");
}
