# Reglas del proyecto: simulador de préstamos (R4)

Soy estudiante y este taller es individual. Tengo que entender y poder explicar
cada línea que entregue. Si me das código, explícame brevemente por qué.

## Qué es

Simulador de préstamos con sistema francés (cuota fija) y alemán (abono fijo a
capital), con tabla de amortización. No hay base de datos, ni Firebase, ni API
externa. Todo corre en el navegador. El enunciado completo está en
`R4-simulador-de-prestamos.md` (es la fuente de verdad).

## Stack

- Next.js (App Router) + React + TypeScript estricto, con `src/`
- CSS mobile-first (módulos CSS), sin Tailwind
- Vitest + React Testing Library para pruebas
- Despliegue en Vercel (lo hago yo)

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm test`: pruebas
- `npm run check`: tipos + ESLint sin advertencias + Prettier + pruebas con cobertura
- `npm run build`: compilación de producción

Antes de decir que algo está terminado, corre `npm run check` y muéstrame el resultado.

## Estructura

- `src/lib/prestamo.ts`: lógica pura de cálculo (sin React)
- `src/lib/validar.ts`: validación de los textos del formulario
- `src/lib/formato.ts`: `pesos()` y `porcentaje()` con `Intl`
- `src/app/`: rutas `/`, `/comparar`, `/historial`
- `src/components/`: componentes de interfaz
- `tests/`: pruebas
- `ia/`: pruebas de contención y `BITACORA.md`
- `calidad/` y `CALIDAD.md`: evidencias de calidad

## Lo que SÍ

- Seguir las reglas de redondeo del enunciado (sección 5): pesos enteros con
  `Math.round`, y la última cuota deja el saldo en exactamente 0.
- Mantener la lógica de negocio en funciones puras, separada de React.
- Calcular la tabla como estado derivado (`useMemo`), no en un estado aparte.
- HTML semántico: `<button>` para acciones, `<a>` para navegar, un solo `<h1>`
  por página, `<label>` en cada campo.
- Errores de formulario en español, junto al campo, con `aria-describedby` y
  `aria-invalid`.
- Accesibilidad WCAG 2.2 AA: foco visible, contraste 4,5:1, uso solo con teclado.
- Diseño responsivo probado en 360, 768 y 1024 px, sin anchos fijos en píxeles.
- Escribir una prueba por cada función nueva de `src/lib/`.
- Mensajes de commit pequeños y claros, uno por paso del taller.

## Lo que NO

- No usar `any`, `// @ts-ignore` ni desactivar reglas de ESLint para que pase.
- No usar `<div onClick>` ni quitar `outline` sin dejar un sustituto.
- No agregar librerías ni dependencias sin preguntarme antes.
- No hacer `git push`, ni `vercel`, ni instalar paquetes por tu cuenta.
- No leer ni mostrar `.env`, claves o credenciales.
- No salir de esta carpeta del proyecto.
- No bajar el umbral de cobertura (80 %) ni borrar pruebas para que pase el check.
- No agregar funciones que el enunciado no pide hasta que lo obligatorio esté listo.
- No usar `NaN` ni `Infinity`: cubrir la tasa 0 y los casos límite.

## Nota sobre Next.js

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
