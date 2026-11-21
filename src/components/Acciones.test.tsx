import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { amortizar } from "@/lib/prestamo";
import { Acciones } from "./Acciones";

const { filas } = amortizar({ monto: 10_000_000, ea: 12, plazo: 12, sistema: "frances" });

describe("Acciones · copiar enlace", () => {
  it("copia la dirección de la página y lo anuncia", async () => {
    const usuario = userEvent.setup();
    render(<Acciones filas={filas} sistema="frances" />);

    await usuario.click(screen.getByRole("button", { name: "Copiar enlace" }));

    expect(await navigator.clipboard.readText()).toBe(window.location.href);
    expect(screen.getByRole("status")).toHaveTextContent("Enlace copiado al portapapeles.");
    expect(screen.queryByLabelText(/enlace de la simulación/i)).not.toBeInTheDocument();
  });

  it("sin Clipboard API deja el enlace seleccionado en un campo", async () => {
    const usuario = userEvent.setup();
    render(<Acciones filas={filas} sistema="frances" />);
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });

    await usuario.click(screen.getByRole("button", { name: "Copiar enlace" }));

    const campo = screen.getByLabelText(/enlace de la simulación/i) as HTMLInputElement;
    expect(campo).toHaveValue(window.location.href);
    expect(campo).toHaveAttribute("readonly");
    expect(campo.selectionStart).toBe(0);
    expect(campo.selectionEnd).toBe(window.location.href.length);
    expect(screen.getByRole("status")).toHaveTextContent(/no se pudo copiar automáticamente/i);
  });
});

describe("Acciones · descargar CSV", () => {
  it("crea un enlace con download, hace clic y libera la URL", async () => {
    const usuario = userEvent.setup();
    let blobCreado: Blob | undefined;
    const crear = vi.fn((blob: Blob) => {
      blobCreado = blob;
      return "blob:prueba";
    });
    const liberar = vi.fn();
    Object.assign(URL, { createObjectURL: crear, revokeObjectURL: liberar });

    const clic = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("amortizacion-frances.csv");
      expect(this.href).toBe("blob:prueba");
    });

    render(<Acciones filas={filas} sistema="frances" />);
    await usuario.click(screen.getByRole("button", { name: "Descargar CSV" }));

    expect(clic).toHaveBeenCalledTimes(1);
    expect(liberar).toHaveBeenCalledWith("blob:prueba");
    expect(blobCreado?.type).toBe("text/csv;charset=utf-8");
    // El BOM (EF BB BF) debe estar en los bytes; text() lo descartaría al decodificar.
    const bytes = new Uint8Array(await blobCreado!.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    const texto = await blobCreado!.text();
    expect(texto.startsWith("Cuota n.º;Cuota;Intereses")).toBe(true);
    expect(texto).toContain("1;885621;94888;790733;9209267");
    expect(screen.getByRole("status")).toHaveTextContent("Tabla descargada en formato CSV.");
    clic.mockRestore();
  });
});
