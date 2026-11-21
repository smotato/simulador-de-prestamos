/**
 * Cabeceras de seguridad que se envían en todas las respuestas.
 *
 * No se incluye Content-Security-Policy: Next.js inserta scripts en línea y una política
 * estricta exige nonces por petición (y vuelve dinámica cada página). Queda como mejora.
 */
export const CABECERAS_DE_SEGURIDAD = [
  // El navegador no adivina el tipo de un archivo: evita ejecutar texto como script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nadie puede incrustar el simulador en un <iframe> de otro sitio (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Al salir hacia otro sitio solo se envía el origen, no la URL con la simulación.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La aplicación no usa cámara, micrófono ni ubicación: se cierran esos permisos.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Obliga a usar HTTPS en visitas futuras (2 años).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
] as const;
