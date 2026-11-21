import { render } from "@testing-library/react";
import { registrarMetrica } from "@/lib/webvitals";
import { WebVitals } from "./WebVitals";

const useReportWebVitals = vi.fn();
vi.mock("next/web-vitals", () => ({
  useReportWebVitals: (callback: unknown) => useReportWebVitals(callback),
}));

describe("WebVitals", () => {
  it("no dibuja nada", () => {
    const { container } = render(<WebVitals />);
    expect(container).toBeEmptyDOMElement();
  });

  it("le pasa a Next la función que registra las métricas (misma referencia siempre)", () => {
    useReportWebVitals.mockClear();
    const { rerender } = render(<WebVitals />);
    rerender(<WebVitals />);

    expect(useReportWebVitals).toHaveBeenCalledWith(registrarMetrica);
    const funciones = new Set(useReportWebVitals.mock.calls.map(([f]) => f));
    expect(funciones.size).toBe(1);
  });
});
