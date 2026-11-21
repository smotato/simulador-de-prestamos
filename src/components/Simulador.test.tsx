import { render, screen } from "@testing-library/react";
import { CLAVE, interpretar } from "@/lib/historial";
import { Simulador } from "./Simulador";

let consulta = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(consulta),
  useRouter: () => ({ replace: vi.fn() }),
}));

function abrir(url: string) {
  consulta = url;
  return render(<Simulador />);
}

beforeEach(() => window.localStorage.clear());

describe("Simulador", () => {
  it("sin datos muestra ayuda y ninguna tabla", () => {
    abrir("");
    expect(screen.getByText(/escriba los datos del préstamo/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("con un enlace válido calcula sola y anuncia la cuota", () => {
    abrir("monto=10000000&tasa=12&plazo=12&sistema=frances");

    expect(screen.getByText(/simulación calculada/i)).toHaveTextContent(/cuota de .*885[.]621/i);
    expect(screen.getByText("Total de intereses").nextSibling).toHaveTextContent("627.448");
    expect(screen.getByText("Total pagado").nextSibling).toHaveTextContent("10.627.448");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveValue("10000000");
  });

  it("con el sistema alemán anuncia la primera cuota", () => {
    abrir("monto=10000000&tasa=12&plazo=12&sistema=aleman");
    expect(screen.getByText(/simulación calculada/i)).toHaveTextContent(
      /primera cuota de .*928[.]221/i,
    );
    expect(screen.getByText("Total de intereses").nextSibling).toHaveTextContent("616.772");
  });

  it("con tasa 0 no aparece NaN ni Infinity", () => {
    const { container } = abrir("monto=12000000&tasa=0&plazo=12&sistema=frances");
    expect(container).toHaveTextContent("1.000.000");
    expect(container).not.toHaveTextContent(/NaN|Infinity/);
  });

  it("con ?monto=abc muestra el formulario con el error y no se rompe", () => {
    abrir("monto=abc");
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveValue("abc");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("guarda la simulación calculada en el historial", () => {
    abrir("monto=10000000&tasa=12&plazo=12&sistema=frances");
    const guardado = interpretar(window.localStorage.getItem(CLAVE));
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
  });

  it("no guarda nada si la URL es inválida o está vacía", () => {
    abrir("monto=abc");
    expect(window.localStorage.getItem(CLAVE)).toBeNull();
  });
});
