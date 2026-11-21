# Bitácora de uso de la IA

Formato de cada entrada: **propósito · evidencia · validación · decisión**.

Herramienta: Claude Code (asistente de IA en la terminal). Sin claves, contraseñas ni datos personales
compartidos con la IA (los permisos de `.claude/settings.json` bloquean leer `.env` y credenciales).

Estado: actualizada hasta el commit `e8007a6` (23 commits) más el de README y CALIDAD. Lo marcado **TODO (estudiante)** lo debo
completar yo con mis propias palabras: la IA no puede afirmar qué entendí ni qué validé yo.

---

## Configuración de la IA (primer commit `a8855c0`)

### 1. Redacción de `AGENTS.md`

- **Propósito:** reglas del proyecto para la IA (stack, comandos, estructura, qué sí y qué no).
- **Evidencia:** `AGENTS.md`. La IA escribió el borrador a partir del enunciado R4 (sección 11), en primera persona, y conservó el bloque de Next.js que `next dev` regenera.
- **Validación:** TODO (estudiante): qué leí y qué cambié yo.
- **Decisión:** TODO (estudiante).

### 2. Permisos de seguridad (`.claude/settings.json`)

- **Propósito:** impedir leer `.env` y claves, no salir de la carpeta, y pedir permiso para `git push`, instalar dependencias y `vercel`.
- **Evidencia:** `.claude/settings.json`, `ia/contencion.test.ts`, `ia/PRUEBAS-CONTENCION.md`.
- **Validación:** se probó en vivo. Leer `.env` con Read quedó bloqueado y crearlo con Bash también. Leer `C:\Windows\win.ini` **no** quedó bloqueado: `Read(../**)` no cubre rutas absolutas.
- **Decisión:** se agregaron reglas con ruta absoluta (`//C:/...`). Siguen sin comprobarse: hay que reiniciar la sesión y repetir la prueba 6 (ver `PRUEBAS-CONTENCION.md`).
- **Límite conocido:** las reglas son patrones de texto, un comando muy rebuscado podría esquivarlas. Mejora posible: `/sandbox`.

### 3. Script `npm run check` y cobertura

- **Propósito:** que tipos, ESLint (sin advertencias), Prettier y pruebas con cobertura se comprueben siempre, también sobre el código de la IA.
- **Evidencia:** `package.json` (scripts), `vitest.config.mts` (umbral del 80 % sobre `src/lib/**`).
- **Validación:** se puso un archivo sin pruebas en `src/lib/` y el check falló por cobertura 0 %. Después se borró.
- **Decisión:** el umbral del 80 % se queda. `coverage/` se excluyó de ESLint y de Git (ESLint la leía y daba 2 advertencias).

### 4. Instalación de las pruebas (segundo commit `147cd8d` con el esqueleto)

- **Propósito:** instalar Vitest y Testing Library como indica el enunciado.
- **Evidencia:** `npm i -D vitest ...` falló con `ERESOLVE`: Vitest 5 pide `@types/node` ≥ 22 y el proyecto traía el 20.
- **Validación:** `npm test` y `tsc` pasan tras subir a `@types/node@22` (mi Node es 22).
- **Decisión:** aceptada. Además `create-next-app` no pudo escribir en la carpeta (ya tenía mi `README.md` y el enunciado), así que se generó en una carpeta temporal y se copió sin pisar mis archivos.

---

## Construcción de la aplicación (pasos de la sección 6)

### 5. Lógica pura de amortización · `98e1b03`

- **Propósito:** `src/lib/prestamo.ts` con `tasaMensual`, `cuotaFrancesa` y `amortizar`, sin React.
- **Evidencia:** `src/lib/prestamo.test.ts`.
- **Validación:** las pruebas reproducen las cifras de la sección 5 del enunciado (francés: cuota 885.621, intereses 627.448; alemán: cuota 1 de 928.221, intereses 616.772; ahorro 10.676). Además, en ambos sistemas la suma de abonos es el monto, el saldo final es 0 y no hay `NaN` con tasa 0.
- **Decisión:** se siguen las reglas de redondeo del enunciado (`Math.round`, última cuota con el saldo restante). TODO (estudiante): explicar con mis palabras por qué la última cuota difiere unos pesos.

### 6. Validación · `e9506f7`

- **Propósito:** `validar()` con un mensaje en español por campo.
- **Evidencia:** `src/lib/validar.ts` y su prueba.
- **Validación:** acepta «12,5», rechaza «abc», plazo 0 y 361.
- **Decisión a confirmar:** el enunciado dice que `validar` «descarta letras y espacios». La IA lo interpretó como **rechazar con error** (así lo exige el criterio de `?monto=abc`). TODO (estudiante): confirmar esa interpretación con el profesor.

### 7. Formato, URL y formulario controlado · `5aef43b`, `c0a3ec5`

- **Propósito:** `pesos()` y `porcentaje()` con `Intl`; formulario controlado que escribe la simulación en la URL.
- **Evidencia:** `src/lib/formato.ts`, `src/lib/url.ts` (no está en el enunciado: la IA lo propuso para poder probar la conversión URL ↔ formulario sin React), `src/components/Formulario.tsx` y sus pruebas.
- **Validación:** pruebas con Testing Library: formulario vacío → errores y foco en el primer campo inválido; plazo 400 → foco en el plazo y no calcula; válido → `router.replace`.
- **Correcciones durante el trabajo:**
  - La IA usó `useRef` para enfocar el campo inválido y ESLint (reglas de React) lo rechazó («Cannot access refs during render»). Se cambió por `document.getElementById(...).focus()`.
  - Vitest no entendía el alias `@/`; se agregó a `vitest.config.mts`.
  - Un comando de shell grande falló sin escribir nada; los archivos se crearon uno a uno con la herramienta de escritura.
  - El commit incluyó por error `.claude/settings.local.json` (aprobaciones locales de permisos). Como no había `push`, se sacó del commit y se agregó al `.gitignore`.
- **Decisión:** `useSearchParams` va dentro de `<Suspense>` porque `next.config.ts` tiene `cacheComponents: true` y la compilación lo exige (la IA lo comprobó en la documentación local de `node_modules/next/dist/docs`).

### 8. Resultado derivado y tabla accesible · `6ca34e3`, `092a786`

- **Propósito:** calcular la tabla con `useMemo` a partir de la URL (sin estado aparte) y mostrarla accesible.
- **Evidencia:** `Simulador.tsx`, `Resumen.tsx`, `TablaAmortizacion.tsx` y pruebas.
- **Validación:** pruebas de `<caption>`, `th scope`, 12 filas por página con 360 cuotas, región desplazable con `tabindex` y `aria-label`, y anuncio «Simulación calculada: cuota de…».
- **Decisión:** la región `aria-live` existe siempre (aunque vacía) para que el lector de pantalla anuncie el cambio. TODO (estudiante): verificar con NVDA/VoiceOver.

### 9. Copiar enlace y descargar CSV · `20d0083`

- **Propósito:** RF-07.
- **Evidencia:** `src/lib/csv.ts`, `src/components/Acciones.tsx` y pruebas.
- **Validación:** el CSV usa `;`, números sin formato y salto `\r\n`. «Copiar enlace» tiene alternativa (campo seleccionado) si no hay Clipboard API. Se libera la URL con `URL.revokeObjectURL`.
- **Decisión:** se agrega un BOM (`EF BB BF`) para que Excel lea bien la «º». El enunciado no lo pide.
- **Correcciones durante el trabajo:**
  - La prueba del BOM fallaba porque `blob.text()` descarta el BOM al decodificar; se cambió a comprobar los bytes. El error era de la prueba, no del código.
  - Un `sed` para escapar `\.` en una expresión regular no funcionó dos veces (el shell se comía la barra invertida); se resolvió con `[.]`.
- **Pendiente (estudiante):** abrir el CSV en Excel.

### 10. Historial en `localStorage` · `97f6d91`

- **Propósito:** RF-08, página `/historial`.
- **Evidencia:** `src/lib/historial.ts`, `Historial.tsx` y pruebas (almacenamientos falsos, incluido uno que siempre lanza error).
- **Validación:** lo leído se valida con la misma `validar()`; se descartan JSON dañado, textos en vez de números, plazos fuera de rango y más de 10 registros.
- **Decisiones:**
  - Repetir la misma simulación la mueve al principio en vez de duplicarla (recargar la página vuelve a calcular).
  - Se lee con `useSyncExternalStore` (fuente externa) en vez de copiarla a un estado.
  - Al borrar, el foco pasa al mensaje de «vacío» para no perderlo.
- **Corrección:** con una sola simulación el texto decía «Las últimas simulación»; se corrigió antes del commit.

### 11. Layout y navegación · `a542ad1`

- **Propósito:** `header`, `nav`, un solo `main`, `footer` y «Saltar al contenido».
- **Evidencia:** `layout.tsx`, `Navegacion.tsx` y pruebas.
- **Decisiones:** sin menú colapsable (3 enlaces cortos caben en 360 px); se quitó la fuente monoespaciada que no se usaba.
- **Contención en vivo:** la IA intentó verificar el HTML con `curl` y mis reglas lo negaron. No se esquivó con otro método. Es evidencia de que la restricción funciona (anotada también en `PRUEBAS-CONTENCION.md`).

### 12. Página `/comparar` · `4be48fc`

- **Propósito:** RF-09, los dos sistemas lado a lado y la frase del ahorro.
- **Evidencia:** `src/lib/comparar.ts`, `Comparador.tsx` y pruebas (ahorro de $10.676, caso de tasa 0).
- **Decisiones:**
  - `Formulario` se reutiliza con las propiedades `ruta`, `conSistema` y `textoBoton`.
  - `/comparar` **no guarda en el historial**: calcula dos sistemas a la vez y habría que elegir uno. Una prueba fija ese comportamiento. TODO (estudiante): confirmar si prefiero otra cosa.
  - Con tasa 0 o plazo 1 los dos pagan lo mismo y la frase lo dice en vez de «$ 0 menos».

---

## Calidad

### 13. Accesibilidad con axe y contraste · `57ea3dc`

- **Propósito:** reto de excelencia «pruebas de accesibilidad con axe dentro de Vitest».
- **Evidencia:** `tests/axe.ts`, `src/components/accesibilidad.test.tsx`, `tests/contraste.test.ts`.
- **Validación:** 0 violaciones en simulador (vacío, con 360 cuotas, con errores), comparador, historial y navegación. El contraste se calcula leyendo `globals.css` en los temas claro y oscuro (texto ≥ 4,5:1, bordes y foco ≥ 3:1). Hay pruebas de control (una imagen sin `alt`, negro sobre blanco = 21:1) para que no sean un falso verde.
- **Límites:** jsdom no calcula estilos reales, por eso `color-contrast` está apagada en axe y se cubre con la prueba de contraste. Esto no reemplaza teclado ni lector de pantalla.
- **Errores de la IA corregidos:**
  - Hizo dos commits con `npm run check` en rojo (2 advertencias de ESLint y una prueba rota) sin mirar el resultado. Se corrigieron con `amend` antes de cualquier `push`; desde entonces solo se hace commit si el check pasa.
  - Su prueba de control usaba `<img>` sin `alt` en JSX y ESLint la rechazó; luego, al reescribir `innerHTML`, rompía la limpieza de React. Se resolvió con un elemento ajeno a React.

### 14. SEO básico · `30b3c11`

- **Propósito:** `robots.txt`, `sitemap.xml`, 404 propia, Open Graph, ícono.
- **Evidencia:** `src/app/robots.ts`, `sitemap.ts`, `not-found.tsx`, `icon.svg`, `src/lib/sitio.ts`.
- **Validación:** se leyeron los archivos generados en `.next` (no con `curl`, que está bloqueado): `robots.txt`, `sitemap.xml`, título y `noindex` de la 404 y del historial.
- **Decisiones:** `/historial` queda fuera del sitemap y con `noindex` (es personal); la URL base sale de `VERCEL_PROJECT_PRODUCTION_URL`. En local valen `http://localhost:3000`.
- **Pendiente (estudiante):** tras desplegar, abrir `/robots.txt` y `/sitemap.xml` y confirmar que traen el dominio de Vercel.

### 15. Hook propio `useSimulacion` · `d651940`

- **Propósito:** el enunciado (sección 1) pide «un hook propio». `Simulador` y `Comparador` repetían el mismo bloque (leer la URL, ver si hay datos y validar).
- **Evidencia:** `src/hooks/useSimulacion.ts` y su prueba; `Simulador.tsx` y `Comparador.tsx` ahora lo usan. `AGENTS.md` ganó una línea en «Estructura» para `src/hooks/`.
- **Validación:** las 154 pruebas anteriores siguieron pasando sin tocarlas (el refactor no cambió el comportamiento) y se agregaron 5 del hook (URL vacía, válida, `?monto=abc`, opción `sistema` y `clave`).
- **Decisión:** el hook solo lee y valida la URL; el cálculo (`amortizar` o `comparar`) queda en cada componente porque es distinto. No guarda estado: la URL sigue siendo la única fuente de verdad. TODO (estudiante): explicar con mis palabras por qué es un hook y no una función normal (usa `useSearchParams` y `useMemo`).

### 16. Core Web Vitals con `useReportWebVitals` · `f5c127d`

- **Propósito:** poder medir LCP, INP y CLS reales (Lighthouse no mide INP), como indica la sección 10.
- **Evidencia:** `src/lib/webvitals.ts` y pruebas, `src/components/WebVitals.tsx` (no dibuja nada), incluido en `layout.tsx`.
- **Validación:** pruebas de que cada métrica se compara con su meta (LCP ≤ 2500 ms, INP ≤ 200 ms, CLS ≤ 0,1, límite inclusivo) y de que a Next se le pasa siempre la misma referencia de función (la documentación advierte que cambiarla duplica datos). La compilación funciona.
- **Límite:** no se pudo ver la salida real, hace falta un navegador. Cada métrica se imprime en la consola como `[web-vitals] LCP 1200 ms ✓ (meta ≤ 2500 ms)` y se acumula en `window.__webVitals`. TODO (estudiante): copiar esos valores a `CALIDAD.md`.

### 17. Cabeceras de seguridad · `d89bb7b`

- **Propósito:** la sección 4 pide cabeceras de seguridad (y ayudan en «Buenas prácticas» de Lighthouse).
- **Evidencia:** `src/lib/cabeceras.ts` y pruebas; `next.config.ts` las aplica con `headers()`.
- **Validación:** como `curl` está bloqueado por mi configuración, se comprobó leyendo `.next/routes-manifest.json` después de compilar: las 5 cabeceras (`nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`) quedan registradas para `/(.*)`.
- **Decisión:** no se agregó `Content-Security-Policy`: Next inserta scripts en línea y una política estricta necesita nonces y vuelve dinámicas las páginas. Queda como mejora. TODO (estudiante): confirmar las cabeceras en la URL de Vercel con DevTools → Red.

### 18. Limpieza de `public/` y peso de JavaScript · `b6138c6`

- **Propósito:** quitar los 5 SVG de ejemplo de Next que no se usan y revisar la meta de JavaScript transferido ≤ 200 kB (sección 10).
- **Evidencia:** se buscó cada archivo en el código (ninguno se usaba) antes de borrarlo; la compilación y las pruebas siguen igual. Para el peso se midió el HTML generado en `.next` con un script temporal fuera del repositorio.
- **Resultado (gzip, aprox.):** JavaScript ≈ 182 kB en `/`, 181 kB en `/comparar` y 180 kB en `/historial` → **cumple** por poco margen (≈ 18 kB). Los tres trozos más grandes (70 + 44 + 39 kB) son React y Next; el código propio es una parte pequeña. HTML ≈ 3 kB, CSS ≈ 2 kB y una fuente de 29 kB.
- **Corrección:** el script contaba la fuente como 0 kB por un error de expresión regular; se midió a mano el archivo (29 kB).
- **Límite:** son números de laboratorio sobre la compilación local. Hay que repetir la medición con DevTools → Red (sin caché) sobre la URL de Vercel. Vercel además sirve con Brotli, que suele ser menor que gzip.

### 19. Reto: modo oscuro y alto contraste · `c35045c`

- **Propósito:** reto de excelencia «modo oscuro y alto contraste sin romper el contraste en ningún tema».
- **Evidencia:** `src/app/globals.css` (4 paletas: clara, oscura, clara + `prefers-contrast: more`, oscura + alto contraste; `color-scheme`; `forced-colors`) y `tests/contraste.test.ts` (52 pruebas).
- **Validación:** la prueba lee las 4 paletas del CSS en el mismo orden de la cascada y exige texto ≥ 4,5:1 (≥ 7:1 en alto contraste) y bordes/foco ≥ 3:1 (≥ 4,5:1 en alto contraste). Para comprobar que no es un falso verde, se degradó a propósito un color (`#1f1f1f` → `#777777`): la prueba falló con «4.48:1, se exige 7:1» y volvió a pasar al restaurarlo.
- **Decisiones:** los botones pasan de `border: 0` a `border: 2px solid transparent` para que en el modo de colores forzados de Windows conserven un borde visible; la página actual del menú se marca además con subrayado en ese modo.

### 20. Reto: Playwright en 3 anchos + axe · `63e364f`

- **Propósito:** reto «prueba en 3 anchos con Playwright (360/768/1024): sin scroll horizontal y 0 violaciones de axe».
- **Evidencia:** `playwright.config.ts`, `e2e/*.spec.ts` (111 pruebas, `npm run test:e2e`), capturas reales en `calidad/capturas/` (`npm run e2e:capturas`). Corren sobre la compilación de producción en Chromium.
- **Qué comprueban:** sin scroll horizontal en 320, 360, 640, 768 y 1024 px en 7 páginas; la tabla se desplaza dentro de su recuadro a 360 px; objetivos táctiles ≥ 44 px; axe completo (incluido el **contraste real**, que jsdom no puede medir) en las 4 paletas y 2 anchos; teclado («Saltar al contenido», foco visible); descarga real del CSV (BOM y `;`); portapapeles; enlace copiado en otra pestaña; historial; título único y un solo h1 por página.
- **Validación de la validación:** se degradó un color (`--texto-suave` a `#bbbbbb`) y axe falló con `color-contrast (serious)`; se restauró.
- **Hallazgos reales (cosas que las pruebas con jsdom no veían):**
  1. **A 1024 px el formulario se salía de su columna** y se montaba sobre el resumen (los campos de texto no se encogían por debajo de su ancho natural en una cuadrícula de `1fr`). Se detectó mirando las capturas; antes de corregir se escribió una prueba que lo reproducía (falló) y se arregló con `minmax(0, 1fr)`, `width: 100%` y `min-width: 0`.
  2. **Dos regiones casi iguales** («Tabla de amortización» en la `<section>` y en el recuadro desplazable). Se quitó el nombre de la `<section>`; el recuadro (el que pide el enunciado) conserva `role="region"` y `aria-label`.
- **Errores míos/de la IA:** un comentario JSX en un lugar inválido rompió la compilación; una prueba contaba los `<li>` del menú junto con los del historial.
- **Límites:** solo Chromium (no Firefox ni Safari), emulación de preferencias (no un lector de pantalla real, no un teléfono real). TODO (estudiante): mirar las capturas y probar en un teléfono.

### 21. README y CALIDAD.md

- **Propósito:** entregables de la sección 9.2 (instrucciones y evidencias de calidad).
- **Evidencia:** `README.md`, `CALIDAD.md`, `calidad/evidencias/npm-run-check.txt`, `calidad/evidencias/e2e-playwright.txt` y `calidad/capturas/`.
- **Validación:** antes de escribir las cifras en `CALIDAD.md` se volvieron a medir (cobertura 99,35 %, 203 pruebas, 111 pruebas del navegador) y se contaron las pruebas citadas (35 de scroll horizontal, 56 de axe, 9 de axe en Vitest, 14 del historial). Se comprobó que no hay animaciones antes de afirmar que `prefers-reduced-motion` no aplica.
- **Honestidad del documento:** lo medido va marcado ✅ con fecha y cómo reproducirlo; lo que depende de Vercel, Lighthouse, un lector de pantalla o un teléfono real va marcado ⏳ con los pasos exactos y `TODO`. Nada se inventó. TODO (estudiante): completar los ⏳ y pegar la URL de producción.
- **Correcciones durante el trabajo:**
  - El `README.md` original estaba guardado en **UTF-16** (lo creó una herramienta de Windows) y las herramientas de la IA se negaron a editarlo; se eliminó y se recreó en UTF-8.
  - `npm run check` falló porque el `README.md` nuevo no cumplía el formato de Prettier; se formateó.
  - El primer registro de `npm run check` mostraba «exit code: 0» aunque el check había fallado (leía el código de `echo`, no el del comando). Se corrigió y se volvió a generar el registro.

---

## Casos en que rechacé o corregí a la IA (mínimo 3)

Esta sección la completo yo, con mis palabras. Hechos reales de la sesión que sirven de candidatos
(elijo los que de verdad me parezcan míos y los explico):

- **Co-autoría en el commit.** La IA propuso un commit con `Co-Authored-By: Claude` y yo lo rechacé y pedí que se hiciera sin ponerla como coautora.
- **Permisos.** La regla `Read(../**)` que propuso la IA no impedía leer fuera de la carpeta (`win.ini` se leyó). Lo detectó la IA al probarla en vivo, no yo; solo cuenta como caso mío si yo lo valido o lo corrijo.
- **Interpretación de «descarta letras y espacios».** Decisión de rechazar con error (entrada 6).
- **Referencias de React.** ESLint rechazó la solución con `useRef` y se cambió (entrada 7).
- **Commits con el check en rojo.** La IA se equivocó dos veces y se corrigió (entrada 13).
- **Archivo local en el repositorio.** `settings.local.json` se había colado en un commit (entrada 7).

1. TODO (estudiante)
2. TODO (estudiante)
3. TODO (estudiante)

> Cada caso: qué propuso la IA, por qué lo rechacé o corregí, y qué hice en su lugar.
