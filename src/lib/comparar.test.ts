import { comparar, frase } from "./comparar";

describe("comparar", () => {
  const datos = { monto: 10_000_000, ea: 12, plazo: 12 };

  it("calcula los dos sistemas con los valores de referencia", () => {
    const c = comparar(datos);
    expect(c.frances.totalIntereses).toBe(627_448);
    expect(c.aleman.totalIntereses).toBe(616_772);
  });

  it("el alemán ahorra $10.676 frente al francés", () => {
    const c = comparar(datos);
    expect(c.ahorro).toBe(10_676);
    expect(c.masBarato).toBe("aleman");
  });

  it("la frase dice qué sistema paga menos y cuánto", () => {
    const texto = frase(comparar(datos));
    expect(texto).toMatch(/^El sistema alemán paga .*10\.676.* menos en intereses\.$/);
  });

  it("con tasa 0 los dos pagan lo mismo y la frase lo dice", () => {
    const c = comparar({ monto: 12_000_000, ea: 0, plazo: 12 });
    expect(c.ahorro).toBe(0);
    expect(c.masBarato).toBeNull();
    expect(frase(c)).toBe("Con estos datos los dos sistemas pagan los mismos intereses.");
  });

  it("con una sola cuota los dos sistemas son iguales", () => {
    const c = comparar({ monto: 5_000_000, ea: 20, plazo: 1 });
    expect(c.masBarato).toBeNull();
  });

  it("si el francés fuera el más barato lo reconoce", () => {
    const c = comparar(datos);
    const invertida = { ...c, masBarato: "frances" as const };
    expect(frase(invertida)).toContain("El sistema francés paga");
  });
});
