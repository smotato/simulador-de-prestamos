import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CLAVE, guardarSimulacion } from "@/lib/historial";
import { Historial } from "./Historial";

beforeEach(() => window.localStorage.clear());

describe("Historial", () => {
  it("sin simulaciones muestra el estado vacío", () => {
    render(<Historial />);
    expect(screen.getByText("Aún no hay simulaciones guardadas.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hacer una simulación/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("button", { name: /borrar/i })).not.toBeInTheDocument();
  });

  it("lista las simulaciones con la más reciente primero y un enlace para repetirlas", () => {
    guardarSimulacion(
      { monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" },
      window.localStorage,
      new Date("2026-01-01T10:00:00Z"),
    );
    guardarSimulacion(
      { monto: 5_000_000, ea: 9.5, plazo: 24, sistema: "aleman" },
      window.localStorage,
      new Date("2026-01-02T10:00:00Z"),
    );
    render(<Historial />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("5.000.000");
    expect(items[0]).toHaveTextContent("24 meses");
    expect(items[0]).toHaveTextContent("9,5 %");
    expect(items[0]).toHaveTextContent("alemán");
    expect(items[1]).toHaveTextContent("10.000.000");

    expect(within(items[0]).getByRole("link", { name: /repetir/i })).toHaveAttribute(
      "href",
      "/?monto=5000000&tasa=9.5&plazo=24&sistema=aleman",
    );
  });

  it("ignora los datos dañados en localStorage sin romperse", () => {
    window.localStorage.setItem(CLAVE, "{esto no es json");
    render(<Historial />);
    expect(screen.getByText("Aún no hay simulaciones guardadas.")).toBeInTheDocument();
  });

  it("el botón borra el historial y deja el foco en el mensaje de vacío", async () => {
    const usuario = userEvent.setup();
    guardarSimulacion({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
    render(<Historial />);

    await usuario.click(screen.getByRole("button", { name: "Borrar historial" }));

    expect(screen.getByText("Aún no hay simulaciones guardadas.")).toHaveFocus();
    expect(window.localStorage.getItem(CLAVE)).toBeNull();
  });

  it("se actualiza si se guarda una simulación mientras está abierto", () => {
    render(<Historial />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    act(() => {
      guardarSimulacion({ monto: 2_000_000, ea: 0, plazo: 1, sistema: "frances" });
    });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("1 mes");
  });
});
