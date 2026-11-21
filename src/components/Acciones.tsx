"use client";

import { useEffect, useRef, useState } from "react";
import { aCsv } from "@/lib/csv";
import type { Fila, Sistema } from "@/lib/prestamo";
import styles from "./Acciones.module.css";

type Props = {
  filas: Fila[];
  sistema: Sistema;
};

export function Acciones({ filas, sistema }: Props) {
  const [mensaje, setMensaje] = useState("");
  // Alternativa cuando el navegador no deja copiar: se muestra el enlace para copiarlo a mano.
  const [enlaceManual, setEnlaceManual] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (enlaceManual !== null) campo.current?.select();
  }, [enlaceManual]);

  async function copiarEnlace() {
    const enlace = window.location.href;
    try {
      await navigator.clipboard.writeText(enlace);
      setEnlaceManual(null);
      setMensaje("Enlace copiado al portapapeles.");
    } catch {
      // Sin Clipboard API (o permiso denegado): dejamos el texto seleccionado en un campo.
      setEnlaceManual(enlace);
      setMensaje("No se pudo copiar automáticamente. Copie el enlace seleccionado con Ctrl+C.");
    }
  }

  function descargarCsv() {
    // El BOM al inicio hace que Excel lea bien la «º» y las tildes.
    const blob = new Blob(["﻿", aCsv(filas)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `amortizacion-${sistema}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    setMensaje("Tabla descargada en formato CSV.");
  }

  return (
    <div className={styles.acciones}>
      <div className={styles.botones}>
        <button type="button" onClick={copiarEnlace}>
          Copiar enlace
        </button>
        <button type="button" onClick={descargarCsv}>
          Descargar CSV
        </button>
      </div>

      {enlaceManual !== null && (
        <div className={styles.manual}>
          <label htmlFor="enlace-manual">Enlace de la simulación</label>
          <input id="enlace-manual" ref={campo} type="text" readOnly value={enlaceManual} />
        </div>
      )}

      <p role="status" className={styles.mensaje}>
        {mensaje}
      </p>
    </div>
  );
}
