import type { Metadata } from "next";
import { Historial } from "@/components/Historial";

export const metadata: Metadata = {
  title: "Historial",
  description: "Las últimas 10 simulaciones guardadas en este navegador.",
};

export default function PaginaHistorial() {
  return (
    <>
      <h1>Historial de simulaciones</h1>
      <p className="intro">
        Se guardan solo en este navegador: nadie más puede verlas y puedes borrarlas cuando quieras.
      </p>
      <Historial />
    </>
  );
}
