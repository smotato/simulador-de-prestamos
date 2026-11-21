import type { Entrada } from "./prestamo";

export type Campo = "monto" | "ea" | "plazo" | "sistema";

/** Textos tal como llegan del formulario o de la URL. */
export type EntradaTexto = Record<Campo, string>;

export type Errores = Partial<Record<Campo, string>>;

export type Resultado = {
  /** Valores numéricos listos para calcular; es null si hay algún error. */
  valor: Entrada | null;
  errores: Errores;
};

export const LIMITES = {
  monto: { min: 1_000_000, max: 500_000_000 },
  ea: { min: 0, max: 60 },
  plazo: { min: 1, max: 360 },
} as const;

/** Quita espacios de los extremos. Letras y símbolos no se aceptan: los rechazan las expresiones. */
function limpiar(texto: string | undefined): string {
  return (texto ?? "").trim();
}

/** Entero con puntos de miles opcionales: «10000000» o «10.000.000». */
function leerEntero(texto: string): number | null {
  if (/^\d+$/.test(texto) || /^\d{1,3}(\.\d{3})+$/.test(texto)) {
    return Number(texto.replaceAll(".", ""));
  }
  return null;
}

/** Decimal con coma o punto y hasta 2 decimales: «12», «12,5», «12.25». */
function leerDecimal(texto: string): number | null {
  if (/^\d+([.,]\d{1,2})?$/.test(texto)) {
    return Number(texto.replace(",", "."));
  }
  return null;
}

export function validar(entrada: Partial<EntradaTexto>): Resultado {
  const errores: Errores = {};

  const textoMonto = limpiar(entrada.monto);
  const monto = textoMonto === "" ? null : leerEntero(textoMonto);
  if (textoMonto === "") {
    errores.monto = "Escriba el monto del préstamo en pesos.";
  } else if (monto === null) {
    errores.monto = "El monto debe ser un número entero, sin letras ni decimales.";
  } else if (monto < LIMITES.monto.min || monto > LIMITES.monto.max) {
    errores.monto = "El monto debe estar entre $1.000.000 y $500.000.000.";
  }

  const textoEa = limpiar(entrada.ea);
  const ea = textoEa === "" ? null : leerDecimal(textoEa);
  if (textoEa === "") {
    errores.ea = "Escriba la tasa efectiva anual (por ejemplo 12).";
  } else if (ea === null) {
    errores.ea = "La tasa debe ser un número con hasta 2 decimales, por ejemplo 12 o 12,5.";
  } else if (ea < LIMITES.ea.min || ea > LIMITES.ea.max) {
    errores.ea = "La tasa debe estar entre 0 y 60 %.";
  }

  const textoPlazo = limpiar(entrada.plazo);
  const plazo = textoPlazo === "" ? null : leerEntero(textoPlazo);
  if (textoPlazo === "") {
    errores.plazo = "Escriba el plazo en meses.";
  } else if (plazo === null) {
    errores.plazo = "El plazo debe ser un número entero de meses.";
  } else if (plazo < LIMITES.plazo.min || plazo > LIMITES.plazo.max) {
    errores.plazo = "El plazo debe estar entre 1 y 360 meses.";
  }

  const sistema = limpiar(entrada.sistema);
  if (sistema !== "frances" && sistema !== "aleman") {
    errores.sistema = "Elija el sistema de pago: francés o alemán.";
  }

  if (Object.keys(errores).length > 0 || monto === null || ea === null || plazo === null) {
    return { valor: null, errores };
  }
  return { valor: { monto, ea, plazo, sistema: sistema as Entrada["sistema"] }, errores };
}
