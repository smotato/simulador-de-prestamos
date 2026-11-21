import { RUTAS_PUBLICAS, urlSitio } from "./sitio";

describe("urlSitio", () => {
  it("usa el dominio de producción de Vercel con https", () => {
    expect(urlSitio({ VERCEL_PROJECT_PRODUCTION_URL: "simulador.vercel.app" })).toBe(
      "https://simulador.vercel.app",
    );
  });

  it("en local usa localhost", () => {
    expect(urlSitio({})).toBe("http://localhost:3000");
  });

  it("no termina en barra, para poder concatenar rutas", () => {
    expect(urlSitio({ VERCEL_PROJECT_PRODUCTION_URL: "a.vercel.app" }).endsWith("/")).toBe(false);
  });
});

describe("RUTAS_PUBLICAS", () => {
  it("incluye el simulador y el comparador, y no el historial personal", () => {
    expect(RUTAS_PUBLICAS).toEqual(["/", "/comparar"]);
  });
});
