import { aCsv } from "./csv";
import { amortizar } from "./prestamo";

describe("aCsv", () => {
  const { filas } = amortizar({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
  const lineas = aCsv(filas).split("\r\n");

  it("usa «;» como separador y trae el encabezado", () => {
    expect(lineas[0]).toBe("Cuota n.º;Cuota;Intereses;Abono a capital;Saldo");
  });

  it("escribe los números sin formato, uno por columna", () => {
    expect(lineas[1]).toBe("1;885621;94888;790733;9209267");
    expect(lineas[12]).toBe("12;885617;8324;877293;0");
  });

  it("tiene una línea por cuota más el encabezado y termina con salto de línea", () => {
    // 12 cuotas + encabezado + el vacío que deja el salto final
    expect(lineas).toHaveLength(14);
    expect(lineas[13]).toBe("");
  });

  it("no usa comas, para que Excel no confunda los decimales", () => {
    expect(aCsv(filas)).not.toContain(",");
  });
});
