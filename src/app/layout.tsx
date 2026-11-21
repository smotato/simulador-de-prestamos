import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Navegacion } from "@/components/Navegacion";
import "./globals.css";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Cada página pone su título y la plantilla le agrega el nombre del sitio.
  title: { default: "Simulador de préstamos", template: "%s · Simulador de préstamos" },
  description:
    "Calcula la cuota de un préstamo con el sistema francés o alemán y consulta la tabla de amortización.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={geistSans.variable}>
      <body>
        <a href="#contenido" className={styles.saltar}>
          Saltar al contenido
        </a>
        <header className={styles.encabezado}>
          <p className={styles.marca}>Simulador de préstamos</p>
          <Navegacion />
        </header>
        {/* tabIndex -1 permite que el enlace «Saltar al contenido» mueva el foco hasta aquí. */}
        <main id="contenido" tabIndex={-1}>
          {children}
        </main>
        <footer className={styles.pie}>
          <p>
            Simulación informativa: las cifras pueden diferir de las de una entidad financiera.
            Taller R4.
          </p>
        </footer>
      </body>
    </html>
  );
}
