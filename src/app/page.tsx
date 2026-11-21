import { Suspense } from "react";
import { Simulador } from "@/components/Simulador";

export default function Home() {
  return (
    <>
      <h1>Simulador de préstamos</h1>
      <p className="intro">
        Calcula tu cuota mensual con el sistema francés o el alemán y mira cómo se reparten el
        capital y los intereses mes a mes.
      </p>
      <Suspense fallback={<p>Cargando simulador…</p>}>
        <Simulador />
      </Suspense>
    </>
  );
}
