import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describir, revisarAccesibilidad } from "../../tests/axe";
import { guardarSimulacion } from "@/lib/historial";
import { Comparador } from "./Comparador";
import { Historial } from "./Historial";
import { Navegacion } from "./Navegacion";
import { Simulador } from "./Simulador";

let consulta = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(consulta),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

async function sinViolaciones(contenedor: Element) {
  const violaciones = await revisarAccesibilidad(contenedor);
  expect(violaciones, describir(violaciones)).toEqual([]);
}

beforeEach(() => {
  consulta = "";
  window.localStorage.clear();
});

describe("accesibilidad con axe (WCAG 2.2 AA)", () => {
  it("Simulador vacío", async () => {
    const { container } = render(<Simulador />);
    await sinViolaciones(container);
  });

  it("Simulador con resultado y tabla", async () => {
    consulta = "monto=10000000&tasa=12&plazo=360&sistema=frances";
    const { container } = render(<Simulador />);
    await sinViolaciones(container);
  });

  it("Simulador con un enlace inválido (errores en los campos)", async () => {
    consulta = "monto=abc&plazo=400";
    const { container } = render(<Simulador />);
    await sinViolaciones(container);
  });

  it("Formulario después de enviarlo vacío (foco y mensajes de error)", async () => {
    const usuario = userEvent.setup();
    const { container } = render(<Simulador />);
    await usuario.click(screen.getByRole("button", { name: "Simular" }));
    await sinViolaciones(container);
  });

  it("Comparador con los dos sistemas", async () => {
    consulta = "monto=10000000&tasa=12&plazo=12";
    const { container } = render(<Comparador />);
    await sinViolaciones(container);
  });

  it("Historial vacío", async () => {
    const { container } = render(<Historial />);
    await sinViolaciones(container);
  });

  it("Historial con simulaciones", async () => {
    guardarSimulacion({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });
    guardarSimulacion({ monto: 5_000_000, ea: 9.5, plazo: 24, sistema: "aleman" });
    const { container } = render(<Historial />);
    await sinViolaciones(container);
  });

  it("Navegación", async () => {
    const { container } = render(<Navegacion />);
    await sinViolaciones(container);
  });

  it("el ayudante sí detecta un problema real (la prueba no es un falso verde)", async () => {
    // Se arma como HTML (fuera de React) a propósito: en JSX, ESLint ya impediría una imagen sin alt.
    const ajeno = document.createElement("div");
    ajeno.innerHTML = '<img src="x.png">';
    document.body.append(ajeno);
    const violaciones = await revisarAccesibilidad(ajeno);
    ajeno.remove();
    expect(violaciones.map((v) => v.id)).toContain("image-alt");
  });
});
