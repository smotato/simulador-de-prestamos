/** Lo mínimo que necesitamos de la métrica que entrega `useReportWebVitals`. */
export type Metrica = {
  id: string;
  name: string;
  value: number;
};

export type Lectura = {
  nombre: string;
  /** Texto para mostrar: «1234 ms» o «0.042». */
  valor: string;
  /** true si cumple la meta del taller; null si esa métrica no tiene meta. */
  cumple: boolean | null;
  meta: string | null;
};

/** Metas de la sección 10 del enunciado (percentil 75). CLS no tiene unidad. */
const METAS: Record<string, { maximo: number; texto: string }> = {
  LCP: { maximo: 2500, texto: "≤ 2500 ms" },
  INP: { maximo: 200, texto: "≤ 200 ms" },
  CLS: { maximo: 0.1, texto: "≤ 0.1" },
  FCP: { maximo: 1800, texto: "≤ 1800 ms" },
  TTFB: { maximo: 800, texto: "≤ 800 ms" },
};

export function leer({ name, value }: Metrica): Lectura {
  const meta = METAS[name];
  return {
    nombre: name,
    valor: name === "CLS" ? value.toFixed(3) : `${Math.round(value)} ms`,
    cumple: meta ? value <= meta.maximo : null,
    meta: meta?.texto ?? null,
  };
}

/** «LCP 1234 ms ✓ (meta ≤ 2500 ms)» */
export function describirMetrica(metrica: Metrica): string {
  const { nombre, valor, cumple, meta } = leer(metrica);
  if (cumple === null) return `${nombre} ${valor}`;
  return `${nombre} ${valor} ${cumple ? "✓" : "✗"} (meta ${meta})`;
}

declare global {
  interface Window {
    /** Métricas de esta visita; en la consola: JSON.stringify(window.__webVitals). */
    __webVitals?: Lectura[];
  }
}

/** Muestra la métrica en la consola y la guarda para copiarla a CALIDAD.md. */
export function registrarMetrica(metrica: Metrica): void {
  console.info(`[web-vitals] ${describirMetrica(metrica)}`);
  if (typeof window !== "undefined") {
    window.__webVitals = [...(window.__webVitals ?? []), leer(metrica)];
  }
}
