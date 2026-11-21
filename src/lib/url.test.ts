import { aParams, desdeParams, tieneDatos } from "./url";

describe("url", () => {
  it("aParams escribe los 4 parámetros", () => {
    const texto = aParams({ monto: 10_000_000, ea: 12.5, plazo: 12, sistema: "aleman" });
    expect(texto).toBe("monto=10000000&tasa=12.5&plazo=12&sistema=aleman");
  });

  it("desdeParams es la inversa de aParams", () => {
    const texto = aParams({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
    expect(desdeParams(new URLSearchParams(texto))).toEqual({
      monto: "10000000",
      ea: "12",
      plazo: "12",
      sistema: "frances",
    });
  });

  it("desdeParams deja vacío lo que falta", () => {
    expect(desdeParams(new URLSearchParams("monto=abc"))).toEqual({
      monto: "abc",
      ea: "",
      plazo: "",
      sistema: "",
    });
  });

  it("tieneDatos distingue una URL vacía de una con datos", () => {
    expect(tieneDatos(desdeParams(new URLSearchParams("")))).toBe(false);
    expect(tieneDatos(desdeParams(new URLSearchParams("monto=abc")))).toBe(true);
  });
});
