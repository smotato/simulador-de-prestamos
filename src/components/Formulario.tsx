"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { validar, type Campo, type Errores, type EntradaTexto } from "@/lib/validar";
import { aParams } from "@/lib/url";
import styles from "./Formulario.module.css";

/** Orden en que aparecen los campos; el foco va al primero con error. */
const ORDEN: Campo[] = ["monto", "ea", "plazo", "sistema"];

type Props = {
  /** Textos con los que arranca el formulario (vienen de la URL). */
  inicial: EntradaTexto;
  /** Errores que se muestran desde el principio (enlace con valores inválidos). */
  erroresIniciales: Errores;
  /** Página donde se escribe la simulación al enviar (por defecto, el simulador). */
  ruta?: string;
  /** Si es false se oculta el sistema de pago (por ejemplo, al comparar los dos). */
  conSistema?: boolean;
  textoBoton?: string;
};

export function Formulario({
  inicial,
  erroresIniciales,
  ruta = "/",
  conSistema = true,
  textoBoton = "Simular",
}: Props) {
  const router = useRouter();
  const [valores, setValores] = useState<EntradaTexto>({
    ...inicial,
    sistema: inicial.sistema || "frances",
  });
  const [errores, setErrores] = useState<Errores>(erroresIniciales);

  function cambiar(campo: Campo, texto: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: texto }));
  }

  /** Al salir de un campo se actualiza solo el error de ese campo. */
  function alSalir(campo: Campo) {
    const { errores: nuevos } = validar(valores);
    setErrores((anteriores) => ({ ...anteriores, [campo]: nuevos[campo] }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const { valor, errores: nuevos } = validar(valores);
    setErrores(nuevos);

    const primero = ORDEN.find((campo) => nuevos[campo]);
    if (primero || !valor) {
      if (primero) document.getElementById(primero)?.focus();
      return;
    }
    router.replace(`${ruta}?${aParams(valor)}`);
  }

  function propiedades(campo: Campo) {
    const error = errores[campo];
    return {
      id: campo,
      name: campo,
      value: valores[campo],
      "aria-invalid": error ? (true as const) : undefined,
      "aria-describedby": error ? `${campo}-error` : `${campo}-ayuda`,
      onBlur: () => alSalir(campo),
    };
  }

  function mensaje(campo: Campo, ayuda: string) {
    const error = errores[campo];
    return error ? (
      <p id={`${campo}-error`} className={styles.error}>
        {error}
      </p>
    ) : (
      <p id={`${campo}-ayuda`} className={styles.ayuda}>
        {ayuda}
      </p>
    );
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <div className={styles.campo}>
        <label htmlFor="monto">Monto del préstamo (COP)</label>
        <input
          {...propiedades("monto")}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          onChange={(e) => cambiar("monto", e.target.value)}
        />
        {mensaje("monto", "Entre $1.000.000 y $500.000.000.")}
      </div>

      <div className={styles.campo}>
        <label htmlFor="ea">Tasa efectiva anual (EA, %)</label>
        <input
          {...propiedades("ea")}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          onChange={(e) => cambiar("ea", e.target.value)}
        />
        {mensaje("ea", "Entre 0 y 60, con hasta 2 decimales. Ejemplo: 12.")}
      </div>

      <div className={styles.campo}>
        <label htmlFor="plazo">Plazo (meses)</label>
        <input
          {...propiedades("plazo")}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          onChange={(e) => cambiar("plazo", e.target.value)}
        />
        {mensaje("plazo", "Entre 1 y 360 meses.")}
      </div>

      {conSistema && (
        <div className={styles.campo}>
          <label htmlFor="sistema">Sistema de pago</label>
          <select {...propiedades("sistema")} onChange={(e) => cambiar("sistema", e.target.value)}>
            <option value="frances">Francés (cuota fija)</option>
            <option value="aleman">Alemán (abono fijo a capital)</option>
          </select>
          {mensaje("sistema", "El francés mantiene la cuota; el alemán baja la cuota cada mes.")}
        </div>
      )}

      <button type="submit" className={styles.boton}>
        {textoBoton}
      </button>
    </form>
  );
}
