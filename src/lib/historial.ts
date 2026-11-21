import type { Entrada } from "./prestamo";
import { validar } from "./validar";

export type Registro = Entrada & {
  /** Momento en que se calculó la simulación, en formato ISO. */
  fecha: string;
};

/** Lo mínimo que necesitamos de localStorage (así las pruebas pueden usar uno falso). */
export type Almacen = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const CLAVE = "historial-simulaciones";
export const MAXIMO = 10;
/** Evento propio para avisar a la misma pestaña (el evento «storage» solo llega a las otras). */
export const EVENTO = "historial-cambio";

/** localStorage puede fallar al acceder (modo privado, datos bloqueados): nunca debe romper la página. */
export function obtenerAlmacen(): Almacen | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Lee el texto guardado, o null si no hay nada o el almacenamiento no está disponible. */
export function leerCrudo(almacen: Almacen | null = obtenerAlmacen()): string | null {
  try {
    return almacen?.getItem(CLAVE) ?? null;
  } catch {
    return null;
  }
}

/**
 * Convierte el texto guardado en registros. Lo que está en localStorage lo puede haber
 * editado cualquiera, así que se descarta todo lo que no pase la misma validación del formulario.
 */
export function interpretar(crudo: string | null): Registro[] {
  if (!crudo) return [];

  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return [];
  }
  if (!Array.isArray(datos)) return [];

  const registros: Registro[] = [];
  for (const dato of datos) {
    if (typeof dato !== "object" || dato === null) continue;
    const { monto, ea, plazo, sistema, fecha } = dato as Record<string, unknown>;
    if (typeof monto !== "number" || typeof ea !== "number" || typeof plazo !== "number") continue;
    if (typeof fecha !== "string" || Number.isNaN(Date.parse(fecha))) continue;

    const { valor } = validar({
      monto: String(monto),
      ea: String(ea),
      plazo: String(plazo),
      sistema: String(sistema),
    });
    if (valor) registros.push({ ...valor, fecha });
  }
  return registros.slice(0, MAXIMO);
}

function esLaMisma(a: Entrada, b: Entrada): boolean {
  return a.monto === b.monto && a.ea === b.ea && a.plazo === b.plazo && a.sistema === b.sistema;
}

/** Pone la simulación de primera. Si ya estaba, se mueve al principio en vez de repetirse. */
export function agregar(registros: Registro[], entrada: Entrada, fecha: Date): Registro[] {
  const nuevo: Registro = { ...entrada, fecha: fecha.toISOString() };
  const otros = registros.filter((registro) => !esLaMisma(registro, entrada));
  return [nuevo, ...otros].slice(0, MAXIMO);
}

function avisar() {
  try {
    window.dispatchEvent(new Event(EVENTO));
  } catch {
    // sin ventana (pruebas en Node): no hay a quién avisar
  }
}

/** Guarda la simulación en el historial. Devuelve false si no se pudo escribir. */
export function guardarSimulacion(
  entrada: Entrada,
  almacen: Almacen | null = obtenerAlmacen(),
  ahora: Date = new Date(),
): boolean {
  if (!almacen) return false;
  try {
    const actuales = interpretar(leerCrudo(almacen));
    almacen.setItem(CLAVE, JSON.stringify(agregar(actuales, entrada, ahora)));
  } catch {
    return false; // cuota llena o bloqueada: la simulación igual se muestra
  }
  avisar();
  return true;
}

export function borrarHistorial(almacen: Almacen | null = obtenerAlmacen()): boolean {
  if (!almacen) return false;
  try {
    almacen.removeItem(CLAVE);
  } catch {
    return false;
  }
  avisar();
  return true;
}
