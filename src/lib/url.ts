import type { Entrada } from "./prestamo";
import type { EntradaTexto } from "./validar";

/** Nombres de los parámetros de la URL: /?monto=…&tasa=…&plazo=…&sistema=… */
const PARAMS = { monto: "monto", ea: "tasa", plazo: "plazo", sistema: "sistema" } as const;

type Lector = { get(nombre: string): string | null };

/** Lee los parámetros de la URL como textos, sin validarlos. Los que faltan quedan vacíos. */
export function desdeParams(params: Lector): EntradaTexto {
  return {
    monto: params.get(PARAMS.monto) ?? "",
    ea: params.get(PARAMS.ea) ?? "",
    plazo: params.get(PARAMS.plazo) ?? "",
    sistema: params.get(PARAMS.sistema) ?? "",
  };
}

/** Indica si la URL trae algún dato de la simulación. */
export function tieneDatos(texto: EntradaTexto): boolean {
  return Object.values(texto).some((valor) => valor !== "");
}

/** Arma la parte de la URL (sin «?») para una simulación ya validada. */
export function aParams({ monto, ea, plazo, sistema }: Entrada): string {
  const params = new URLSearchParams();
  params.set(PARAMS.monto, String(monto));
  params.set(PARAMS.ea, String(ea));
  params.set(PARAMS.plazo, String(plazo));
  params.set(PARAMS.sistema, sistema);
  return params.toString();
}
