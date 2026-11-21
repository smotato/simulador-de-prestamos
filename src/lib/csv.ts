import type { Fila } from "./prestamo";

/** Separador de columnas: el Excel en español espera «;» (la coma es su separador decimal). */
export const SEPARADOR = ";";

const ENCABEZADO = ["Cuota n.º", "Cuota", "Intereses", "Abono a capital", "Saldo"];

/**
 * Convierte la tabla de amortización en texto CSV.
 * Los números van sin formato (sin «$» ni puntos de miles) para que Excel los trate como números.
 */
export function aCsv(filas: Fila[]): string {
  const lineas = [
    ENCABEZADO.join(SEPARADOR),
    ...filas.map((f) => [f.numero, f.cuota, f.intereses, f.capital, f.saldo].join(SEPARADOR)),
  ];
  return lineas.join("\r\n") + "\r\n";
}
