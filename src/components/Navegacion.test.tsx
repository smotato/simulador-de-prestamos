import { render, screen } from "@testing-library/react";
import { Navegacion } from "./Navegacion";

let ruta = "/";
vi.mock("next/navigation", () => ({ usePathname: () => ruta }));

describe("Navegacion", () => {
  it("es una navegación con nombre y enlaces reales", () => {
    ruta = "/";
    render(<Navegacion />);

    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Simulador" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Comparar" })).toHaveAttribute("href", "/comparar");
    expect(screen.getByRole("link", { name: "Historial" })).toHaveAttribute("href", "/historial");
  });

  it("marca con aria-current solo la página actual", () => {
    ruta = "/historial";
    render(<Navegacion />);

    expect(screen.getByRole("link", { name: "Historial" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Simulador" })).not.toHaveAttribute("aria-current");
  });
});
