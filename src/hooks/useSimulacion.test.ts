import { renderHook } from "@testing-library/react";
import { useSimulacion } from "./useSimulacion";

let consulta = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(consulta),
}));

function leer(url: string, opciones?: Parameters<typeof useSimulacion>[0]) {
  consulta = url;
  return renderHook(() => useSimulacion(opciones)).result.current;
}

describe("useSimulacion", () => {
  it("sin datos: no hay valor ni errores que mostrar", () => {
    const r = leer("");
    expect(r.hayDatos).toBe(false);
    expect(r.valor).toBeNull();
    expect(r.clave).toBe("");
  });

  it("con una URL válida devuelve los números", () => {
    const r = leer("monto=10000000&tasa=12,5&plazo=12&sistema=aleman");
    expect(r.hayDatos).toBe(true);
    expect(r.errores).toEqual({});
    expect(r.valor).toEqual({ monto: 10_000_000, ea: 12.5, plazo: 12, sistema: "aleman" });
    expect(r.texto.ea).toBe("12,5");
  });

  it("con ?monto=abc devuelve el error y ningún valor, sin lanzar excepciones", () => {
    const r = leer("monto=abc");
    expect(r.hayDatos).toBe(true);
    expect(r.valor).toBeNull();
    expect(r.errores.monto).toBeDefined();
    expect(r.errores.plazo).toBeDefined();
  });

  it("con la opción sistema ignora el de la URL (lo usa el comparador)", () => {
    const sinSistema = leer("monto=10000000&tasa=12&plazo=12");
    expect(sinSistema.valor).toBeNull();
    expect(sinSistema.errores.sistema).toBeDefined();

    const conOpcion = leer("monto=10000000&tasa=12&plazo=12", { sistema: "frances" });
    expect(conOpcion.errores).toEqual({});
    expect(conOpcion.valor?.sistema).toBe("frances");
  });

  it("la clave cambia con la URL, para reiniciar el formulario", () => {
    const a = leer("monto=1000000&tasa=12&plazo=12&sistema=frances").clave;
    const b = leer("monto=2000000&tasa=12&plazo=12&sistema=frances").clave;
    expect(a).not.toBe(b);
  });
});
