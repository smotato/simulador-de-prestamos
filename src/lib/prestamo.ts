export type Sistema = "frances" | "aleman";

export type Entrada = {
  monto: number;
  ea: number;
  plazo: number;
  sistema: Sistema;
};

export type Fila = {
  numero: number;
  cuota: number;
  intereses: number;
  capital: number;
  saldo: number;
};

export type Resumen = {
  primeraCuota: number;
  ultimaCuota: number;
  totalPagado: number;
  totalIntereses: number;
};

/** Tasa mensual a partir de la tasa efectiva anual (en porcentaje): i = (1 + EA/100)^(1/12) − 1 */
export function tasaMensual(ea: number): number {
  return Math.pow(1 + ea / 100, 1 / 12) - 1;
}

/** Cuota fija teórica del sistema francés (sin redondear). Con tasa 0 evita la división por cero. */
export function cuotaFrancesa(monto: number, i: number, n: number): number {
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

/** Construye la tabla de amortización y el resumen, con las reglas de redondeo del taller. */
export function amortizar({ monto, ea, plazo, sistema }: Entrada): {
  filas: Fila[];
  resumen: Resumen;
} {
  const i = tasaMensual(ea);
  const cuotaFija = Math.round(cuotaFrancesa(monto, i, plazo));
  const abonoFijo = Math.round(monto / plazo);

  const filas: Fila[] = [];
  let saldo = monto;

  for (let numero = 1; numero <= plazo; numero++) {
    const intereses = Math.round(saldo * i);
    const esUltima = numero === plazo;

    let capital: number;
    if (esUltima) {
      capital = saldo; // el saldo final queda exactamente en 0
    } else if (sistema === "frances") {
      capital = cuotaFija - intereses;
    } else {
      capital = abonoFijo;
    }

    saldo -= capital;
    filas.push({ numero, cuota: capital + intereses, intereses, capital, saldo });
  }

  const totalPagado = filas.reduce((suma, fila) => suma + fila.cuota, 0);
  const resumen: Resumen = {
    primeraCuota: filas[0].cuota,
    ultimaCuota: filas[filas.length - 1].cuota,
    totalPagado,
    totalIntereses: totalPagado - monto,
  };

  return { filas, resumen };
}
