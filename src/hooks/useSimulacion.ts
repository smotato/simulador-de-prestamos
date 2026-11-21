"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Sistema } from "@/lib/prestamo";
import { desdeParams, tieneDatos } from "@/lib/url";
import { validar } from "@/lib/validar";

type Opciones = {
  /** Si se indica, se ignora el sistema de la URL y se usa este (por ejemplo, al comparar). */
  sistema?: Sistema;
};

/**
 * Lee la simulación que vive en la URL (?monto=…&tasa=…&plazo=…&sistema=…) y la valida.
 * No guarda nada en un estado: todo se deriva de la URL, que es la única fuente de verdad.
 */
export function useSimulacion({ sistema }: Opciones = {}) {
  const params = useSearchParams();
  // Cambia cuando cambia la URL: sirve de «key» para reiniciar el formulario.
  const clave = params.toString();

  const texto = useMemo(() => desdeParams(params), [params]);
  const hayDatos = tieneDatos(texto);
  const { valor, errores } = useMemo(
    () => validar(sistema ? { ...texto, sistema } : texto),
    [texto, sistema],
  );

  return {
    /** Textos tal como vienen de la URL, sin validar. */
    texto,
    /** Si la URL trae algún dato de la simulación. */
    hayDatos,
    /** Números listos para calcular, o null si hay algún error. */
    valor,
    /** Un mensaje por campo inválido. */
    errores,
    clave,
  };
}
