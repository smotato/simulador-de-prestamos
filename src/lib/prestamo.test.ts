import { amortizar, cuotaFrancesa, tasaMensual, type Entrada } from "./prestamo";

const base: Omit<Entrada, "sistema"> = { monto: 10_000_000, ea: 12, plazo: 12 };

describe("tasaMensual", () => {
  it("convierte EA 12 % en ≈ 0,0094888", () => {
    expect(tasaMensual(12)).toBeCloseTo(0.0094888, 7);
  });

  it("con EA 0 la tasa mensual es 0", () => {
    expect(tasaMensual(0)).toBe(0);
  });
});

describe("cuotaFrancesa", () => {
  it("da 885.621 para el caso de referencia", () => {
    expect(Math.round(cuotaFrancesa(10_000_000, tasaMensual(12), 12))).toBe(885_621);
  });

  it("con tasa 0 es monto / n, sin NaN ni Infinity", () => {
    const cuota = cuotaFrancesa(12_000_000, 0, 12);
    expect(cuota).toBe(1_000_000);
    expect(Number.isFinite(cuota)).toBe(true);
  });
});

describe("amortizar · sistema francés (referencia)", () => {
  const { filas, resumen } = amortizar({ ...base, sistema: "frances" });

  it("cuota 1", () => {
    expect(filas[0]).toEqual({
      numero: 1,
      cuota: 885_621,
      intereses: 94_888,
      capital: 790_733,
      saldo: 9_209_267,
    });
  });

  it("cuota 2", () => {
    expect(filas[1]).toEqual({
      numero: 2,
      cuota: 885_621,
      intereses: 87_385,
      capital: 798_236,
      saldo: 8_411_031,
    });
  });

  it("cuota 12 (última)", () => {
    expect(filas[11]).toEqual({
      numero: 12,
      cuota: 885_617,
      intereses: 8_324,
      capital: 877_293,
      saldo: 0,
    });
  });

  it("resumen", () => {
    expect(resumen).toEqual({
      primeraCuota: 885_621,
      ultimaCuota: 885_617,
      totalPagado: 10_627_448,
      totalIntereses: 627_448,
    });
  });
});

describe("amortizar · sistema alemán (referencia)", () => {
  const { filas, resumen } = amortizar({ ...base, sistema: "aleman" });

  it("cuota 1", () => {
    expect(filas[0]).toEqual({
      numero: 1,
      cuota: 928_221,
      intereses: 94_888,
      capital: 833_333,
      saldo: 9_166_667,
    });
  });

  it("cuota 12 (última)", () => {
    expect(filas[11]).toEqual({
      numero: 12,
      cuota: 841_244,
      intereses: 7_907,
      capital: 833_337,
      saldo: 0,
    });
  });

  it("resumen", () => {
    expect(resumen.totalPagado).toBe(10_616_772);
    expect(resumen.totalIntereses).toBe(616_772);
  });

  it("ahorra $10.676 en intereses frente al francés", () => {
    const frances = amortizar({ ...base, sistema: "frances" }).resumen.totalIntereses;
    expect(frances - resumen.totalIntereses).toBe(10_676);
  });
});

describe.each(["frances", "aleman"] as const)("invariantes · %s", (sistema) => {
  it.each([
    { monto: 10_000_000, ea: 12, plazo: 12 },
    { monto: 1_000_000, ea: 0, plazo: 7 },
    { monto: 500_000_000, ea: 60, plazo: 360 },
    { monto: 1_234_567, ea: 18.75, plazo: 1 },
    { monto: 3_333_333, ea: 9.5, plazo: 37 },
  ])("monto $monto, EA $ea, plazo $plazo", (datos) => {
    const { filas, resumen } = amortizar({ ...datos, sistema });
    expect(filas).toHaveLength(datos.plazo);
    expect(filas.reduce((s, f) => s + f.capital, 0)).toBe(datos.monto);
    expect(filas[filas.length - 1].saldo).toBe(0);
    for (const f of filas) {
      for (const v of Object.values(f)) expect(Number.isFinite(v)).toBe(true);
      expect(Number.isInteger(f.cuota)).toBe(true);
    }
    expect(resumen.totalIntereses).toBe(resumen.totalPagado - datos.monto);
  });
});

describe("tasa 0", () => {
  it("francés: cuota = monto / plazo, sin NaN", () => {
    const { filas, resumen } = amortizar({
      monto: 12_000_000,
      ea: 0,
      plazo: 12,
      sistema: "frances",
    });
    expect(filas[0].cuota).toBe(1_000_000);
    expect(resumen.totalIntereses).toBe(0);
  });
});
