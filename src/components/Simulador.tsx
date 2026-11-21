"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { amortizar } from "@/lib/prestamo";
import { pesos } from "@/lib/formato";
import { validar } from "@/lib/validar";
import { desdeParams, tieneDatos } from "@/lib/url";
import { Formulario } from "./Formulario";
import { Resumen } from "./Resumen";
import { TablaAmortizacion } from "./TablaAmortizacion";
import styles from "./Simulador.module.css";

export function Simulador() {
  const params = useSearchParams();
  const clave = params.toString();
  const texto = useMemo(() => desdeParams(params), [params]);
  const hayDatos = tieneDatos(texto);
  const { valor, errores } = useMemo(() => validar(texto), [texto]);

  // Estado derivado: la tabla se calcula a partir de la URL, no se guarda en un estado aparte.
  const simulacion = useMemo(() => (valor ? amortizar(valor) : null), [valor]);

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
        <div aria-live="polite" role="status">
          {anuncio}
        </div>
        {simulacion ? (
          <Resumen resumen={simulacion.resumen} sistema={valor!.sistema} />
        ) : (
          <p className={styles.vacio}>Aquí verá la cuota, el total pagado y los intereses.</p>
        )}
      </section>

      {simulacion && (
        <section className={styles.tabla} aria-labelledby="titulo-tabla">
          <h2 id="titulo-tabla">Tabla de amortización</h2>
          <TablaAmortizacion key={clave} filas={simulacion.filas} />
        </section>
      )}
    </div>
  );
}
