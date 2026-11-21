"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { validar } from "@/lib/validar";
import { desdeParams, tieneDatos } from "@/lib/url";
import { Formulario } from "./Formulario";

export function Simulador() {
  const params = useSearchParams();
  const texto = useMemo(() => desdeParams(params), [params]);
  const hayDatos = tieneDatos(texto);
  // Con una URL inválida el formulario aparece con sus errores; con una URL vacía, limpio.
  const { errores } = useMemo(() => validar(texto), [texto]);

  return (
    <>
      {!hayDatos && (
        <p>Escriba los datos del préstamo y pulse «Simular» para ver la cuota y la tabla.</p>
      )}
      {/* La clave reinicia el formulario cuando la URL cambia (enlace nuevo, atrás o adelante). */}
      <Formulario
        key={params.toString()}
        inicial={texto}
        erroresIniciales={hayDatos ? errores : {}}
      />
    </>
  );
}
