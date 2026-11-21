import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NoEncontrada() {
  return (
    <>
      <h1>Página no encontrada</h1>
      <p>La dirección que abrió no existe o ya no está disponible.</p>
      <p>
        <Link href="/">Volver al simulador</Link>
      </p>
    </>
  );
}
