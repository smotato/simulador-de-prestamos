import { pesos } from "./formato";
import { amortizar, type Entrada, type Resumen, type Sistema } from "./prestamo";

export type Comparacion = {
  frances: Resumen;
  aleman: Resumen;
  /** Diferencia en intereses entre los dos sistemas (siempre positiva o cero). */
  ahorro: number;
  /** El sistema que paga menos intereses, o null si pagan lo mismo. */
  masBarato: Sistema | null;
};

const NOMBRES: Record<Sistema, string> = { frances: "francés", aleman: "alemán" };

/** Calcula los dos sistemas con los mismos datos. */
export function comparar(datos: Omit<Entrada, "sistema">): Comparacion {
  const frances = amortizar({ ...datos, sistema: "frances" }).resumen;
  const aleman = amortizar({ ...datos, sistema: "aleman" }).resumen;
  const diferencia = frances.totalIntereses - aleman.totalIntereses;

  return {
    frances,
    aleman,
    ahorro: Math.abs(diferencia),
    masBarato: diferencia > 0 ? "aleman" : diferencia < 0 ? "frances" : null,
  };
}

/** «El sistema alemán paga $ 10.676 menos en intereses.» */
export function frase({ masBarato, ahorro }: Comparacion): string {
  if (!masBarato) return "Con estos datos los dos sistemas pagan los mismos intereses.";
  return `El sistema ${NOMBRES[masBarato]} paga ${pesos(ahorro)} menos en intereses.`;
}
