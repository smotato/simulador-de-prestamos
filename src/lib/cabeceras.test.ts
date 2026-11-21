import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CABECERAS_DE_SEGURIDAD } from "./cabeceras";

const valorDe = (nombre: string) => CABECERAS_DE_SEGURIDAD.find((c) => c.key === nombre)?.value;

describe("CABECERAS_DE_SEGURIDAD", () => {
  it("evita que el navegador adivine tipos de archivo", () => {
    expect(valorDe("X-Content-Type-Options")).toBe("nosniff");
  });

  it("impide incrustar la página en un iframe", () => {
    expect(valorDe("X-Frame-Options")).toBe("DENY");
  });

  it("no filtra la URL completa a otros sitios", () => {
    expect(valorDe("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("cierra los permisos que la app no usa", () => {
    const politica = valorDe("Permissions-Policy");
    for (const permiso of ["camera=()", "microphone=()", "geolocation=()"]) {
      expect(politica).toContain(permiso);
    }
  });

  it("fuerza HTTPS por al menos un año", () => {
    const hsts = valorDe("Strict-Transport-Security") ?? "";
    const segundos = Number(/max-age=(\d+)/.exec(hsts)?.[1]);
    expect(segundos).toBeGreaterThanOrEqual(31_536_000);
  });

  it("no hay cabeceras repetidas", () => {
    const nombres = CABECERAS_DE_SEGURIDAD.map((c) => c.key);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it("next.config.ts las aplica a todas las rutas", () => {
    const config = readFileSync(resolve(__dirname, "../../next.config.ts"), "utf8");
    expect(config).toContain("CABECERAS_DE_SEGURIDAD");
    expect(config).toContain('source: "/(.*)"');
  });
});
