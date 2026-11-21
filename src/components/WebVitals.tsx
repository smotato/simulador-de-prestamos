"use client";

import { useReportWebVitals } from "next/web-vitals";
import { registrarMetrica } from "@/lib/webvitals";

/**
 * No dibuja nada: solo mide LCP, INP y CLS reales de quien usa la página.
 * La función se pasa por referencia fija (importada) para no reportar datos duplicados.
 */
export function WebVitals() {
  useReportWebVitals(registrarMetrica);
  return null;
}
