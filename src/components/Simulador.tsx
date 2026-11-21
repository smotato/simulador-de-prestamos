"use client";

import { useEffect, useMemo } from "react";
import { amortizar } from "@/lib/prestamo";
import { pesos } from "@/lib/formato";
import { guardarSimulacion } from "@/lib/historial";
import { useSimulacion } from "@/hooks/useSimulacion";
import { Formulario } from "./Formulario";
import { Acciones } from "./Acciones";
import { Resumen } from "./Resumen";
import { TablaAmortizacion } from "./TablaAmortizacion";
import styles from "./Simulador.module.css";

export function Simulador() {
  const { texto, hayDatos, valor, errores, clave } = useSimulacion();

  // Estado derivado: la tabla se calcula a partir de la URL, no se guarda en un estado aparte.
  const simulacion = useMemo(() => (valor ? amortizar(valor) : null), [valor]);

  // Cada simulación calculada se guarda en el historial (efecto: escribe fuera de React).
  useEffect(() => {
    if (valor) guardarSimulacion(valor);
  }, [valor]);

  const anuncio =
    valor && simulacion
      ? `Simulación calculada: ${valor.sistema === "frances" ? "cuota" : "primera cuota"} de ${pesos(simulacion.resumen.primeraCuota)}`
      : "";

  return (
    <div className={styles.contenedor}>
      <section className={styles.formulario} aria-labelledby="titulo-datos">
        <h2 id="titulo-datos">Datos del préstamo</h2>
        {!hayDatos && (
          <p>Escriba los datos del préstamo y pulse «Simular» para ver la cuota y la tabla.</p>
        )}
        {/* La clave reinicia el formulario cuando la URL cambia (enlace nuevo, atrás o adelante). */}
        <Formulario key={clave} inicial={texto} erroresIniciales={hayDatos ? errores : {}} />
      </section>

      {/* La región existe siempre, para que el lector de pantalla anuncie el cambio de texto. */}
      <section className={styles.resumen} aria-labelledby="titulo-resultado">
        <h2 id="titulo-resultado">Resultado</h2>
        <div aria-live="polite" role="status" className={styles.anuncio}>
          {anuncio}
        </div>
        {simulacion ? (
          <>
            <Resumen resumen={simulacion.resumen} sistema={valor!.sistema} />
            <Acciones filas={simulacion.filas} sistema={valor!.sistema} />
          </>
        ) : (
          <p className={styles.vacio}>Aquí verá la cuota, el total pagado y los intereses.</p>
        )}
      </section>

      {simulacion && (
        // Sin nombre propio: el recuadro desplazable de la tabla ya es la región con nombre.
        <section className={styles.tabla}>
          <h2 id="titulo-tabla">Tabla de amortización</h2>
          <TablaAmortizacion key={clave} filas={simulacion.filas} />
        </section>
      )}
    </div>
  );
}
