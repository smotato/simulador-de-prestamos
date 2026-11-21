import { validar, type EntradaTexto } from "./validar";

const valida: EntradaTexto = { monto: "10000000", ea: "12", plazo: "12", sistema: "frances" };

describe("validar", () => {
  it("acepta una entrada correcta y devuelve números", () => {
    const { valor, errores } = validar(valida);
    expect(errores).toEqual({});
    expect(valor).toEqual({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
  });

  it("acepta la coma decimal «12,5»", () => {
    const { valor, errores } = validar({ ...valida, ea: "12,5" });
    expect(errores.ea).toBeUndefined();
    expect(valor?.ea).toBe(12.5);
  });

  it("acepta el punto decimal y espacios en los extremos", () => {
    expect(validar({ ...valida, ea: " 12.25 " }).valor?.ea).toBe(12.25);
  });

  it("acepta el monto con puntos de miles", () => {
    expect(validar({ ...valida, monto: "10.000.000" }).valor?.monto).toBe(10_000_000);
  });

  it("rechaza «abc» y no devuelve valor", () => {
    const { valor, errores } = validar({ ...valida, monto: "abc" });
    expect(valor).toBeNull();
    expect(errores.monto).toMatch(/entero/);
  });

  it("rechaza letras mezcladas con números y espacios internos", () => {
    expect(validar({ ...valida, plazo: "12 meses" }).errores.plazo).toBeDefined();
    expect(validar({ ...valida, monto: "1 000 000" }).errores.monto).toBeDefined();
  });

  it("rechaza un plazo de 0 y uno de 361, acepta 1 y 360", () => {
    expect(validar({ ...valida, plazo: "0" }).errores.plazo).toBe(
      "El plazo debe estar entre 1 y 360 meses.",
    );
    expect(validar({ ...valida, plazo: "361" }).errores.plazo).toBeDefined();
    expect(validar({ ...valida, plazo: "400" }).errores.plazo).toBeDefined();
    expect(validar({ ...valida, plazo: "1" }).errores.plazo).toBeUndefined();
    expect(validar({ ...valida, plazo: "360" }).errores.plazo).toBeUndefined();
  });

  it("rechaza un plazo con decimales", () => {
    expect(validar({ ...valida, plazo: "12,5" }).errores.plazo).toBeDefined();
  });

  it("valida los límites del monto", () => {
    expect(validar({ ...valida, monto: "999999" }).errores.monto).toBeDefined();
    expect(validar({ ...valida, monto: "1000000" }).errores.monto).toBeUndefined();
    expect(validar({ ...valida, monto: "500000000" }).errores.monto).toBeUndefined();
    expect(validar({ ...valida, monto: "500000001" }).errores.monto).toBeDefined();
  });

  it("valida los límites y los decimales de la tasa", () => {
    expect(validar({ ...valida, ea: "0" }).errores.ea).toBeUndefined();
    expect(validar({ ...valida, ea: "60" }).errores.ea).toBeUndefined();
    expect(validar({ ...valida, ea: "60,01" }).errores.ea).toBeDefined();
    expect(validar({ ...valida, ea: "12,345" }).errores.ea).toBeDefined();
    expect(validar({ ...valida, ea: "-1" }).errores.ea).toBeDefined();
  });

  it("rechaza un sistema desconocido", () => {
    expect(validar({ ...valida, sistema: "otro" }).errores.sistema).toBeDefined();
  });

  it("pide los campos vacíos y reporta todos los errores a la vez", () => {
    const { valor, errores } = validar({ monto: "", ea: "", plazo: "", sistema: "" });
    expect(valor).toBeNull();
    expect(Object.keys(errores).sort()).toEqual(["ea", "monto", "plazo", "sistema"]);
  });

  it("tolera campos ausentes (por ejemplo, una URL incompleta)", () => {
    const { valor, errores } = validar({});
    expect(valor).toBeNull();
    expect(Object.keys(errores)).toHaveLength(4);
  });
});
