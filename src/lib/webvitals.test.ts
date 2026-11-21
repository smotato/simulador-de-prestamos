import { describirMetrica, leer, registrarMetrica } from "./webvitals";

const metrica = (name: string, value: number) => ({ id: `${name}-1`, name, value });

describe("leer", () => {
  it("LCP bajo la meta cumple y se redondea a ms", () => {
    expect(leer(metrica("LCP", 1234.6))).toEqual({
      nombre: "LCP",
      valor: "1235 ms",
      cumple: true,
      meta: "≤ 2500 ms",
    });
  });

  it("LCP de 2501 ms no cumple, y 2500 ms sí (el límite es inclusivo)", () => {
    expect(leer(metrica("LCP", 2501)).cumple).toBe(false);
    expect(leer(metrica("LCP", 2500)).cumple).toBe(true);
  });

  it("INP: la meta es 200 ms", () => {
    expect(leer(metrica("INP", 199)).cumple).toBe(true);
    expect(leer(metrica("INP", 201)).cumple).toBe(false);
  });

  it("CLS no lleva unidad, usa 3 decimales y su meta es 0.1", () => {
    expect(leer(metrica("CLS", 0.0421)).valor).toBe("0.042");
    expect(leer(metrica("CLS", 0.1)).cumple).toBe(true);
    expect(leer(metrica("CLS", 0.11)).cumple).toBe(false);
  });

  it("una métrica sin meta no se evalúa", () => {
    expect(leer(metrica("Next.js-hydration", 40)).cumple).toBeNull();
  });
});

describe("describirMetrica", () => {
  it("indica si cumple la meta", () => {
    expect(describirMetrica(metrica("LCP", 1200))).toBe("LCP 1200 ms ✓ (meta ≤ 2500 ms)");
    expect(describirMetrica(metrica("INP", 350))).toBe("INP 350 ms ✗ (meta ≤ 200 ms)");
  });

  it("sin meta solo muestra el valor", () => {
    expect(describirMetrica(metrica("Next.js-render", 12))).toBe("Next.js-render 12 ms");
  });
});

describe("registrarMetrica", () => {
  beforeEach(() => {
    window.__webVitals = undefined;
  });

  it("la escribe en la consola y la acumula en window.__webVitals", () => {
    const consola = vi.spyOn(console, "info").mockImplementation(() => {});

    registrarMetrica(metrica("LCP", 1000));
    registrarMetrica(metrica("CLS", 0));

    expect(consola).toHaveBeenCalledWith("[web-vitals] LCP 1000 ms ✓ (meta ≤ 2500 ms)");
    expect(window.__webVitals?.map((m) => m.nombre)).toEqual(["LCP", "CLS"]);
    consola.mockRestore();
  });
});
