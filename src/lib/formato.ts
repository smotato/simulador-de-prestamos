const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatoPorcentaje = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 885621 → «$ 885.621» (el espacio puede ser no separable según el entorno). */
export function pesos(n: number): string {
  return formatoPesos.format(n);
}

/** 12.5 → «12,5 %». La tasa se maneja como porcentaje (12 = 12 %). */
export function porcentaje(n: number): string {
  return `${formatoPorcentaje.format(n)} %`;
}
