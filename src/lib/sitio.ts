/** Páginas públicas que van en el sitemap. /historial no: es personal y está vacío para un robot. */
export const RUTAS_PUBLICAS = ["/", "/comparar"] as const;

type Entorno = Record<string, string | undefined>;

/**
 * Dirección base del sitio, necesaria para el sitemap, robots.txt y las etiquetas Open Graph.
 * Vercel entrega el dominio de producción en VERCEL_PROJECT_PRODUCTION_URL al compilar,
 * así no hay que escribir la dirección a mano ni guardar variables de entorno propias.
 */
export function urlSitio(entorno: Entorno = process.env): string {
  const dominio = entorno.VERCEL_PROJECT_PRODUCTION_URL;
  return dominio ? `https://${dominio}` : "http://localhost:3000";
}
