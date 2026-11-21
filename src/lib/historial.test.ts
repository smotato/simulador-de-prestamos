import {
  CLAVE,
  MAXIMO,
  agregar,
  borrarHistorial,
  guardarSimulacion,
  interpretar,
  leerCrudo,
  obtenerAlmacen,
  type Almacen,
} from "./historial";
import type { Entrada } from "./prestamo";

const base: Entrada = { monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" };
const fecha = new Date("2026-01-15T10:00:00.000Z");

/** localStorage falso en memoria. */
function falso(inicial: Record<string, string> = {}): Almacen {
  const datos = new Map(Object.entries(inicial));
  return {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => void datos.set(clave, valor),
    removeItem: (clave) => void datos.delete(clave),
  };
}

/** Almacén que siempre lanza error, como pasa con la cuota llena o el modo privado. */
const roto: Almacen = {
  getItem: () => {
    throw new Error("bloqueado");
  },
  setItem: () => {
    throw new Error("cuota llena");
  },
  removeItem: () => {
    throw new Error("bloqueado");
  },
};

describe("interpretar (lo leído de localStorage)", () => {
  it("devuelve vacío si no hay nada", () => {
    expect(interpretar(null)).toEqual([]);
    expect(interpretar("")).toEqual([]);
  });

  it("devuelve vacío si el JSON está dañado o no es una lista", () => {
    expect(interpretar("{no es json")).toEqual([]);
    expect(interpretar('{"monto":1}')).toEqual([]);
    expect(interpretar("42")).toEqual([]);
  });

  it("acepta registros válidos", () => {
    const registro = { ...base, fecha: fecha.toISOString() };
    expect(interpretar(JSON.stringify([registro]))).toEqual([registro]);
  });

  it("descarta los registros inválidos y conserva los buenos", () => {
    const bueno = { ...base, fecha: fecha.toISOString() };
    const datos = [
      { ...bueno, plazo: 400 }, // fuera de rango
      { ...bueno, monto: "10000000" }, // texto en vez de número
      { ...bueno, sistema: "otro" },
      { ...bueno, fecha: "no es fecha" },
      { ...bueno, ea: 12.345 }, // demasiados decimales
      null,
      "texto",
      bueno,
    ];
    expect(interpretar(JSON.stringify(datos))).toEqual([bueno]);
  });

  it("no devuelve más de 10 aunque alguien haya editado el almacenamiento", () => {
    const muchos = Array.from({ length: 25 }, (_, i) => ({
      ...base,
      plazo: i + 1,
      fecha: fecha.toISOString(),
    }));
    expect(interpretar(JSON.stringify(muchos))).toHaveLength(MAXIMO);
  });
});

describe("agregar", () => {
  it("pone la simulación nueva de primera", () => {
    const antes = agregar([], base, fecha);
    const despues = agregar(antes, { ...base, plazo: 24 }, new Date("2026-02-01T00:00:00Z"));
    expect(despues.map((r) => r.plazo)).toEqual([24, 12]);
  });

  it("guarda como máximo 10 y descarta la más antigua", () => {
    let registros = agregar([], base, fecha);
    for (let plazo = 13; plazo <= 25; plazo++) {
      registros = agregar(registros, { ...base, plazo }, fecha);
    }
    expect(registros).toHaveLength(MAXIMO);
    expect(registros[0].plazo).toBe(25);
    expect(registros.some((r) => r.plazo === 12)).toBe(false);
  });

  it("no repite la misma simulación: la mueve al principio con la fecha nueva", () => {
    const uno = agregar([], base, fecha);
    const dos = agregar(uno, { ...base, plazo: 24 }, fecha);
    const nueva = new Date("2026-03-01T00:00:00Z");
    const tres = agregar(dos, base, nueva);
    expect(tres.map((r) => r.plazo)).toEqual([12, 24]);
    expect(tres[0].fecha).toBe(nueva.toISOString());
  });
});

describe("guardarSimulacion y borrarHistorial", () => {
  it("guarda y se puede volver a leer", () => {
    const almacen = falso();
    expect(guardarSimulacion(base, almacen, fecha)).toBe(true);
    expect(interpretar(leerCrudo(almacen))).toEqual([{ ...base, fecha: fecha.toISOString() }]);
  });

  it("borra todo el historial", () => {
    const almacen = falso();
    guardarSimulacion(base, almacen, fecha);
    expect(borrarHistorial(almacen)).toBe(true);
    expect(almacen.getItem(CLAVE)).toBeNull();
  });

  it("si el almacenamiento falla no lanza error y avisa con false", () => {
    expect(guardarSimulacion(base, roto, fecha)).toBe(false);
    expect(borrarHistorial(roto)).toBe(false);
    expect(leerCrudo(roto)).toBeNull();
  });

  it("sin almacenamiento disponible tampoco se rompe", () => {
    expect(guardarSimulacion(base, null, fecha)).toBe(false);
    expect(borrarHistorial(null)).toBe(false);
    expect(leerCrudo(null)).toBeNull();
  });

  it("recupera un historial dañado y lo reemplaza al guardar", () => {
    const almacen = falso({ [CLAVE]: "{dañado" });
    expect(guardarSimulacion(base, almacen, fecha)).toBe(true);
    expect(interpretar(leerCrudo(almacen))).toHaveLength(1);
  });

  it("obtenerAlmacen devuelve localStorage en el navegador", () => {
    expect(obtenerAlmacen()).toBe(window.localStorage);
  });
});
