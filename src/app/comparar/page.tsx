import type { Metadata } from "next";
import { Suspense } from "react";
import { Comparador } from "@/components/Comparador";

export const metadata: Metadata = {
  title: "Comparar sistemas",
  description:
    "Compara el sistema francés y el alemán con los mismos datos y mira cuánto cambia el total de intereses.",
};

export default function PaginaComparar() {
  return (
    <>
      <h1>Comparar sistemas de pago</h1>
      <p className="intro">
        Con los mismos datos, mira cuánto cambia el total de intereses según el sistema que elijas.
      </p>
      <Suspense fallback={<p>Cargando comparación…</p>}>
        <Comparador />
      </Suspense>
    </>
  );
}
