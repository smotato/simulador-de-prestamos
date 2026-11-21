import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formulario } from "./Formulario";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const vacio = { monto: "", ea: "", plazo: "", sistema: "" };

beforeEach(() => replace.mockClear());

describe("Formulario", () => {
  it("al enviar vacío muestra los errores y deja el foco en el primer campo inválido", async () => {
    const usuario = userEvent.setup();
    render(<Formulario inicial={vacio} erroresIniciales={{}} />);

    await usuario.click(screen.getByRole("button", { name: /simular/i }));

    const monto = screen.getByLabelText(/monto del préstamo/i);
    expect(monto).toHaveFocus();
    expect(monto).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Escriba el monto del préstamo en pesos.")).toBeInTheDocument();
    expect(screen.getByLabelText(/plazo/i)).toHaveAttribute("aria-invalid", "true");
    expect(replace).not.toHaveBeenCalled();
  });

  it("el error queda enlazado al campo con aria-describedby", async () => {
    const usuario = userEvent.setup();
    render(<Formulario inicial={vacio} erroresIniciales={{}} />);
    await usuario.click(screen.getByRole("button", { name: /simular/i }));

    const plazo = screen.getByLabelText(/plazo/i);
    expect(plazo).toHaveAccessibleDescription("Escriba el plazo en meses.");
  });

  it("con un plazo de 400 el foco va al plazo y no se calcula nada", async () => {
    const usuario = userEvent.setup();
    render(<Formulario inicial={vacio} erroresIniciales={{}} />);

    await usuario.type(screen.getByLabelText(/monto del préstamo/i), "10000000");
    await usuario.type(screen.getByLabelText(/tasa efectiva/i), "12");
    await usuario.type(screen.getByLabelText(/plazo/i), "400");
    await usuario.click(screen.getByRole("button", { name: /simular/i }));

    expect(screen.getByLabelText(/plazo/i)).toHaveFocus();
    expect(screen.getByText("El plazo debe estar entre 1 y 360 meses.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("valida al salir del campo (onBlur)", async () => {
    const usuario = userEvent.setup();
    render(<Formulario inicial={vacio} erroresIniciales={{}} />);

    await usuario.type(screen.getByLabelText(/plazo/i), "0");
    await usuario.tab();

    expect(screen.getByText("El plazo debe estar entre 1 y 360 meses.")).toBeInTheDocument();
  });

  it("con datos válidos escribe la simulación en la URL", async () => {
    const usuario = userEvent.setup();
    render(<Formulario inicial={vacio} erroresIniciales={{}} />);

    await usuario.type(screen.getByLabelText(/monto del préstamo/i), "10.000.000");
    await usuario.type(screen.getByLabelText(/tasa efectiva/i), "12,5");
    await usuario.type(screen.getByLabelText(/plazo/i), "12");
    await usuario.click(screen.getByRole("button", { name: /simular/i }));

    expect(replace).toHaveBeenCalledWith("/?monto=10000000&tasa=12.5&plazo=12&sistema=frances");
  });

  it("muestra los errores iniciales de un enlace inválido", () => {
    render(
      <Formulario
        inicial={{ ...vacio, monto: "abc" }}
        erroresIniciales={{ monto: "El monto debe ser un número entero, sin letras ni decimales." }}
      />,
    );
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/monto del préstamo/i)).toHaveValue("abc");
  });
});
