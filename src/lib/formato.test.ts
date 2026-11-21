import { pesos, porcentaje } from "./formato";

/** Compara ignorando el símbolo y los espacios (normales o no separables). */
const soloNumero = (texto: string) => texto.replace(/[^\d.,-]/g, "");

describe("pesos", () => {
  it("usa puntos de miles", () => {
    expect(pesos(1_234_567)).toContain("1.234.567");
    expect(soloNumero(pesos(885_621))).toBe("885.621");
  });

  it("no muestra decimales", () => {
    expect(soloNumero(pesos(1000.6))).toBe("1.001");
  });

  it("incluye el símbolo de pesos", () => {
    expect(pesos(10)).toContain("$");
  });

  it("formatea cero", () => {
    expect(soloNumero(pesos(0))).toBe("0");
  });
});

describe("porcentaje", () => {
  it("usa coma decimal", () => {
    expect(porcentaje(12.5)).toBe("12,5 %");
  });

  it("no agrega decimales innecesarios", () => {
    expect(porcentaje(12)).toBe("12 %");
    expect(porcentaje(0)).toBe("0 %");
  });

  it("muestra hasta 2 decimales", () => {
    expect(porcentaje(12.25)).toBe("12,25 %");
  });
});
