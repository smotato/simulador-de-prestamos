import type { MetadataRoute } from "next";
import { RUTAS_PUBLICAS, urlSitio } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_PUBLICAS.map((ruta) => ({
    url: `${urlSitio()}${ruta === "/" ? "" : ruta}`,
    changeFrequency: "monthly",
    priority: ruta === "/" ? 1 : 0.7,
  }));
}
