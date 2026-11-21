import type { Locator, Page } from "@playwright/test";

/** Anchos que exige el enunciado (360, 768, 1024), más 320 (reflow WCAG 1.4.10) y 640 (≈ zoom 200 %). */
export const ANCHOS = [320, 360, 640, 768, 1024] as const;

const ALTO = 800;
export const tamano = (ancho: number) => ({ width: ancho, height: ALTO });

export type Ruta = {
  nombre: string;
  url: string;
  /** Algo que solo existe cuando la página ya terminó de cargar. */
  listo: (page: Page) => Locator;
  /** Texto que se guarda en localStorage antes de abrir la página (para probar el historial con datos). */
  historial?: string;
};

const SIMULACION = "/?monto=10000000&tasa=12&plazo=360&sistema=frances";

export const RUTAS: Ruta[] = [
  {
    nombre: "inicio",
    url: "/",
    listo: (page) => page.getByRole("button", { name: "Simular" }),
  },
  {
    nombre: "resultado",
    url: SIMULACION,
    listo: (page) => page.getByRole("table"),
  },
  {
    nombre: "errores",
    url: "/?monto=abc&plazo=400",
    listo: (page) => page.getByText("El monto debe ser un número entero, sin letras ni decimales."),
  },
  {
    nombre: "comparar",
    url: "/comparar?monto=10000000&tasa=12&plazo=12",
    listo: (page) => page.getByText(/El sistema alemán paga/),
  },
  {
    nombre: "historial-vacio",
    url: "/historial",
    listo: (page) => page.getByText("Aún no hay simulaciones guardadas."),
  },
  {
    nombre: "historial",
    url: "/historial",
    listo: (page) => page.getByRole("button", { name: "Borrar historial" }),
    historial: JSON.stringify([
      {
        monto: 5_000_000,
        ea: 9.5,
        plazo: 24,
        sistema: "aleman",
        fecha: "2026-01-02T10:00:00.000Z",
      },
      {
        monto: 10_000_000,
        ea: 12,
        plazo: 12,
        sistema: "frances",
        fecha: "2026-01-01T10:00:00.000Z",
      },
    ]),
  },
  {
    nombre: "404",
    url: "/esta-pagina-no-existe",
    listo: (page) => page.getByRole("heading", { name: "Página no encontrada" }),
  },
];

/** Abre una ruta (con historial precargado si hace falta) y espera a que termine de cargar. */
export async function abrir(page: Page, ruta: Ruta) {
  if (ruta.historial) {
    const datos = ruta.historial;
    await page.addInitScript((valor) => {
      window.localStorage.setItem("historial-simulaciones", valor);
    }, datos);
  }
  await page.goto(ruta.url);
  await ruta.listo(page).first().waitFor();
}

export const TEMAS = [
  { nombre: "claro", media: { colorScheme: "light", contrast: "no-preference" } },
  { nombre: "oscuro", media: { colorScheme: "dark", contrast: "no-preference" } },
  { nombre: "claro + alto contraste", media: { colorScheme: "light", contrast: "more" } },
  { nombre: "oscuro + alto contraste", media: { colorScheme: "dark", contrast: "more" } },
] as const;
