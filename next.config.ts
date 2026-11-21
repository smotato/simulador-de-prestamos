import type { NextConfig } from "next";
import { CABECERAS_DE_SEGURIDAD } from "./src/lib/cabeceras";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [{ source: "/(.*)", headers: [...CABECERAS_DE_SEGURIDAD] }];
  },
};

export default nextConfig;
