import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CLAVE } from "@/lib/historial";
import { Comparador } from "./Comparador";

let consulta = "";
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(consulta),
  useRouter: () => ({ replace }),
}));

function abrir(url: string) {
  consulta = url;
  return render(<Comparador />);
}

beforeEach(() => {
  replace.mockClear();
  window.localStorage.clear();
});

describe("Comparador", () => {
  it("sin datos muestra ayuda y no hay tarjetas", () => {
    abrir("");
    expect(screen.getByText(/pulse «comparar»/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("no pide el sistema de pago: se calculan los dos", () => {
    abrir("");
    expect(screen.queryByLabelText(/sistema de pago/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comparar" })).toBeInTheDocument();
  });

  it("muestra los dos sistemas lado a lado con sus totales", () => {
    abrir("monto=10000000&tasa=12&plazo=12");

    const [frances, aleman] = screen.getAllByRole("article");
    expect(within(frances).getByRole("heading", { name: "Sistema francés" })).toBeInTheDocument();
    expect(frances).toHaveTextContent("627.448");
    expect(frances).toHaveTextContent("885.621");
    expect(within(aleman).getByRole("heading", { name: "Sistema alemán" })).toBeInTheDocument();
    expect(aleman).toHaveTextContent("616.772");
    expect(aleman).toHaveTextContent("928.221");
  });

  it("anuncia cuánto se ahorra en intereses", () => {
    abrir("monto=10000000&tasa=12&plazo=12");
    const estado = screen.getByRole("status");
    expect(estado).toHaveTextContent(/El sistema alemán paga .*10\.676.* menos en intereses\./);
  });

  it("cada sistema enlaza a su tabla de amortización", () => {
    abrir("monto=10000000&tasa=12&plazo=12");
    const enlaces = screen.getAllByRole("link", { name: /ver la tabla de amortización/i });
    expect(enlaces[0]).toHaveAttribute("href", "/?monto=10000000&tasa=12&plazo=12&sistema=frances");
    expect(enlaces[1]).toHaveAttribute("href", "/?monto=10000000&tasa=12&plazo=12&sistema=aleman");
  });

  it("con tasa 0 dice que pagan lo mismo y no aparece NaN", () => {
    const { container } = abrir("monto=12000000&tasa=0&plazo=12");
    expect(screen.getByRole("status")).toHaveTextContent(/los dos sistemas pagan los mismos/i);
    expect(container).not.toHaveTextContent(/NaN|Infinity/);
  });

  it("con una URL inválida muestra el error y ninguna comparación", () => {
    abrir("monto=abc&tasa=12&plazo=12");
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("al enviar escribe la comparación en la URL de /comparar", async () => {
    const usuario = userEvent.setup();
    abrir("");

    await usuario.type(screen.getByLabelText(/monto del préstamo/i), "10000000");
    await usuario.type(screen.getByLabelText(/tasa efectiva/i), "12");
    await usuario.type(screen.getByLabelText(/plazo/i), "12");
    await usuario.click(screen.getByRole("button", { name: "Comparar" }));

    expect(replace).toHaveBeenCalledWith(
      "/comparar?monto=10000000&tasa=12&plazo=12&sistema=frances",
    );
  });

  it("no llena el historial (solo guarda el simulador)", () => {
    abrir("monto=10000000&tasa=12&plazo=12");
    expect(window.localStorage.getItem(CLAVE)).toBeNull();
  });
});
