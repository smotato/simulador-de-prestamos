"use client";

import { useState } from "react";
import { pesos } from "@/lib/formato";
import type { Fila } from "@/lib/prestamo";
import styles from "./TablaAmortizacion.module.css";

const FILAS_POR_PAGINA = 12;

type Props = {
  filas: Fila[];
};

export function TablaAmortizacion({ filas }: Props) {
  const [pagina, setPagina] = useState(0);
  const totalPaginas = Math.ceil(filas.length / FILAS_POR_PAGINA);

  // Solo se dibujan 12 filas a la vez, aunque el plazo sea de 360 cuotas.
  const inicio = pagina * FILAS_POR_PAGINA;
  const visibles = filas.slice(inicio, inicio + FILAS_POR_PAGINA);
  const desde = visibles[0].numero;
  const hasta = visibles[visibles.length - 1].numero;

  return (
    <div>
      {/* En pantallas pequeñas se desplaza la tabla dentro de su recuadro, no la página. */}
      <div
        className={styles.recuadro}
        role="region"
        aria-label="Tabla de amortización (se desplaza horizontalmente)"
        tabIndex={0}
      >
        <table className={styles.tabla}>
          <caption>
            Cuotas {desde} a {hasta} de {filas.length}
          </caption>
          <thead>
            <tr>
              <th scope="col">Cuota n.º</th>
              <th scope="col">Cuota</th>
              <th scope="col">Intereses</th>
              <th scope="col">Abono a capital</th>
              <th scope="col">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => (
              <tr key={fila.numero}>
                <th scope="row">{fila.numero}</th>
                <td>{pesos(fila.cuota)}</td>
                <td>{pesos(fila.intereses)}</td>
                <td>{pesos(fila.capital)}</td>
                <td>{pesos(fila.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <nav className={styles.paginacion} aria-label="Paginación de la tabla">
          <button type="button" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0}>
            Anterior
          </button>
          <span>
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => p + 1)}
            disabled={pagina === totalPaginas - 1}
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
