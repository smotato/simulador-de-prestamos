import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { amortizar } from "@/lib/prestamo";
import { TablaAmortizacion } from "./TablaAmortizacion";

const { filas: doce } = amortizar({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
const { filas: muchas } = amortizar({ monto: 100_000_000, ea: 15, plazo: 360, sistema: "frances" });

describe("TablaAmortizacion", () => {
  it("es una tabla accesible con título, encabezados de columna y de fila", () => {
    render(<TablaAmortizacion filas={doce} />);

    const tabla = screen.getByRole("table", { name: /cuotas 1 a 12 de 12/i });
    expect(within(tabla).getAllByRole("columnheader")).toHaveLength(5);
    expect(within(tabla).getAllByRole("rowheader")).toHaveLength(12);
  });

  it("muestra los valores de referencia de la primera cuota", () => {
    render(<TablaAmortizacion filas={doce} />);

    const primera = screen.getAllByRole("row")[1];
    expect(primera).toHaveTextContent("885.621");
    expect(primera).toHaveTextContent("94.888");
    expect(primera).toHaveTextContent("790.733");
    expect(primera).toHaveTextContent("9.209.267");
  });

  it("con 12 cuotas no hay paginación", () => {
    render(<TablaAmortizacion filas={doce} />);
    expect(screen.queryByRole("navigation", { name: /paginación/i })).not.toBeInTheDocument();
  });

  it("con 360 cuotas dibuja solo 12 filas a la vez", () => {
    render(<TablaAmortizacion filas={muchas} />);
    expect(screen.getAllByRole("rowheader")).toHaveLength(12);
    expect(screen.getByText("Página 1 de 30")).toBeInTheDocument();
  });

  it("se puede paginar con los botones", async () => {
    const usuario = userEvent.setup();
    render(<TablaAmortizacion filas={muchas} />);

    const anterior = screen.getByRole("button", { name: "Anterior" });
    expect(anterior).toBeDisabled();

    await usuario.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("table", { name: /cuotas 13 a 24 de 360/i })).toBeInTheDocument();
    expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("13");
    expect(anterior).toBeEnabled();
  });

  it("el recuadro desplazable se alcanza con teclado y tiene nombre", () => {
    render(<TablaAmortizacion filas={doce} />);
    const region = screen.getByRole("region", { name: /tabla de amortización/i });
    expect(region).toHaveAttribute("tabindex", "0");
  });
});
