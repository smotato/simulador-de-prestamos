import { Suspense } from "react";
import { Simulador } from "@/components/Simulador";

export default function Home() {
  return (
    <main>
      <h1>Simulador de préstamos</h1>
      <Suspense fallback={<p>Cargando simulador…</p>}>
        <Simulador />
      </Suspense>
    </main>
  );
}
