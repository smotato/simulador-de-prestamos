"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { pesos, porcentaje } from "@/lib/formato";
import { EVENTO, borrarHistorial, interpretar, leerCrudo } from "@/lib/historial";
import { aParams } from "@/lib/url";
import styles from "./Historial.module.css";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

/** localStorage es una fuente externa: React se suscribe a sus cambios en vez de copiarla a un estado. */
function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso); // cambios hechos en esta pestaña
  window.addEventListener("storage", aviso); // cambios hechos en otras pestañas
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export function Historial() {
  // En el servidor no hay localStorage: undefined significa «todavía no se ha leído».
  const crudo = useSyncExternalStore<string | null | undefined>(
    suscribir,
    () => leerCrudo(),
    () => undefined,
  );
  const registros = useMemo(() => (crudo === undefined ? null : interpretar(crudo)), [crudo]);

  // Al borrar, el botón desaparece: el foco pasa al mensaje de «vacío» para no perderse.
  const vacio = useRef<HTMLParagraphElement>(null);
  const enfocarVacio = useRef(false);
  const hayRegistros = registros === null || registros.length > 0;
  useEffect(() => {
    if (!hayRegistros && enfocarVacio.current) {
      enfocarVacio.current = false;
      vacio.current?.focus();
    }
  }, [hayRegistros]);

  function borrar() {
    enfocarVacio.current = true;
    borrarHistorial();
  }

  if (registros === null) return <p>Cargando historial…</p>;

  if (registros.length === 0) {
    return (
      <div>
        <p ref={vacio} tabIndex={-1} role="status" className={styles.vacio}>
          Aún no hay simulaciones guardadas.
        </p>
        <p>
          <Link href="/">Hacer una simulación</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        {registros.length > 1
          ? `Sus últimas ${registros.length} simulaciones, la más reciente primero.`
          : "Su última simulación."}
      </p>
      <ul className={styles.lista}>
        {registros.map((registro) => (
          <li key={registro.fecha + aParams(registro)} className={styles.item}>
            <p className={styles.detalle}>
              <strong>{pesos(registro.monto)}</strong> a {registro.plazo}{" "}
              {registro.plazo === 1 ? "mes" : "meses"}, tasa EA {porcentaje(registro.ea)}, sistema{" "}
              {registro.sistema === "frances" ? "francés" : "alemán"}
            </p>
            <p className={styles.fecha}>
              <time dateTime={registro.fecha}>{formatoFecha.format(new Date(registro.fecha))}</time>
            </p>
            <Link href={`/?${aParams(registro)}`}>Repetir esta simulación</Link>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.borrar} onClick={borrar}>
        Borrar historial
      </button>
    </div>
  );
}
