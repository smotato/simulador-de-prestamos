"use client";

import { useMemo } from "react";
import Link from "next/link";
import { comparar, frase } from "@/lib/comparar";
import { aParams, desdeParams, tieneDatos } from "@/lib/url";
import { validar } from "@/lib/validar";
import { useSearchParams } from "next/navigation";
import { Formulario } from "./Formulario";
import { Resumen } from "./Resumen";
import styles from "./Comparador.module.css";

export function Comparador() {
  const params = useSearchParams();
  const clave = params.toString();
  const texto = useMemo(() => desdeParams(params), [params]);
  const hayDatos = tieneDatos(texto);

  // Aquí se calculan los dos sistemas, así que el sistema de la URL no importa.
  const { valor, errores } = useMemo(() => validar({ ...texto, sistema: "frances" }), [texto]);
  const comparacion = useMemo(() => (valor ? comparar(valor) : null), [valor]);

  return (
    <div className={styles.contenedor}>
      <section aria-labelledby="titulo-datos">
        <h2 id="titulo-datos">Datos del préstamo</h2>
        {!hayDatos && (
          <p>Escriba los datos del préstamo y pulse «Comparar» para ver los dos sistemas.</p>
        )}
        <Formulario
          key={clave}
          inicial={texto}
          erroresIniciales={hayDatos ? errores : {}}
          ruta="/comparar"
          conSistema={false}
          textoBoton="Comparar"
        />
      </section>

      <section aria-labelledby="titulo-comparacion">
        <h2 id="titulo-comparacion">Comparación</h2>
        {/* La región existe siempre, para que el lector de pantalla anuncie el cambio de texto. */}
        <div role="status" aria-live="polite" className={styles.frase}>
          {comparacion && frase(comparacion)}
        </div>

        {valor && comparacion ? (
          <div className={styles.sistemas}>
            {(["frances", "aleman"] as const).map((sistema) => (
              <article key={sistema} className={styles.sistema}>
                <h3>{sistema === "frances" ? "Sistema francés" : "Sistema alemán"}</h3>
                <Resumen resumen={comparacion[sistema]} sistema={sistema} conNombre={false} />
                <Link href={`/?${aParams({ ...valor, sistema })}`}>
                  Ver la tabla de amortización
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.vacio}>Aquí verá los dos sistemas lado a lado.</p>
        )}
      </section>
    </div>
  );
}
