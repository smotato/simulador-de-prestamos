# Evidencias de calidad

Taller R4 · Simulador de préstamos. Este documento reúne las evidencias de la sección 10 del enunciado.

**Cómo leerlo:**

- ✅ **Medido** en este repositorio, con la fecha y cómo reproducirlo.
- ⏳ **Pendiente**: necesita la dirección desplegada en Vercel, una herramienta del navegador (Lighthouse, axe DevTools, lector de pantalla) o un dispositivo real. Cada punto trae los pasos exactos.

- **Dirección de producción:** https://simulador-de-prestamos-chi.vercel.app
- **Fecha de las mediciones automáticas:** 2026-11-21 (Node 22.14, Chromium de Playwright)

## 1. Resumen

| Requisito (sección 10)             | Meta                                                          | Resultado                                                                                         | Estado                               |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `npm run check`                    | Pasa (tipos, ESLint sin advertencias, Prettier, pruebas)      | Pasa, código de salida 0 ([registro](calidad/evidencias/npm-run-check.txt))                       | ✅                                   |
| Cobertura de la lógica de negocio  | ≥ 80 %                                                        | 99,35 % sentencias · 98,3 % ramas · 100 % funciones ([§9](#9-pruebas-y-cobertura))                | ✅                                   |
| Pruebas unitarias y de componentes | —                                                             | 247 pasan (Vitest)                                                                                | ✅                                   |
| Pruebas en navegador real          | —                                                             | 112 pasan (Playwright) ([registro](calidad/evidencias/e2e-playwright.txt))                        | ✅                                   |
| Sin scroll horizontal              | 320, 360, 640, 768 y 1024 px                                  | Cumple en las 7 páginas ([§3](#3-responsive-360--768--1024-px))                                   | ✅                                   |
| axe                                | 0 violaciones                                                 | 0 en jsdom y 0 en Chromium (4 paletas × 7 páginas × 2 anchos) ([§4](#4-accesibilidad-wcag-22-aa)) | ✅                                   |
| Contraste                          | Texto ≥ 4,5:1 · controles ≥ 3:1                               | Cumple en 4 paletas; alto contraste ≥ 7:1 ([§4](#4-accesibilidad-wcag-22-aa))                     | ✅                                   |
| JavaScript transferido             | ≤ 200 kB                                                      | ≈ 180–182 kB (gzip, local) ([§6](#6-peso-de-la-página))                                           | ✅ (repetir en producción)           |
| Página inicial                     | ≤ 1 MB                                                        | ≈ 215 kB                                                                                          | ✅ (repetir en producción)           |
| Cabeceras de seguridad             | Presentes                                                     | 5 cabeceras en todas las rutas ([§7](#7-html-semántico-y-buenas-prácticas))                       | ✅ (confirmar en producción)         |
| Lighthouse móvil                   | Rendimiento ≥ 90 · Accesibilidad, Buenas prácticas y SEO ≥ 95 | —                                                                                                 | ⏳ [§2](#2-lighthouse)               |
| LCP / INP / CLS                    | ≤ 2,5 s · ≤ 200 ms · ≤ 0,1                                    | —                                                                                                 | ⏳ [§5](#5-core-web-vitals)          |
| Lector de pantalla y teléfono real | Una pasada                                                    | —                                                                                                 | ⏳ [§4](#4-accesibilidad-wcag-22-aa) |
| Retos de excelencia                | Al menos 3 con evidencia                                      | 3 ([§8](#8-retos-de-excelencia))                                                                  | ✅                                   |

## 2. Lighthouse

Primera medición hecha el **2026-11-21** sobre la dirección de producción, con Lighthouse 13.5.0 desde DevTools (throttling simulado, modo Navegación). Informes en `calidad/lighthouse/`.

> 🔄 **Estas mediciones son del diseño anterior.** Después se rediseñó la interfaz (solo CSS, sin cambiar el JavaScript), así que hay que repetirlas todas sobre la versión final (pasos abajo).

> ⚠️ **Medición provisional.** Cinco de los seis informes traen el aviso «las extensiones de Chrome afectaron al rendimiento» y el de `/` en escritorio terminó con un error al tomar la captura (`PROTOCOL_TIMEOUT`). Hay que **repetirla en una ventana de incógnito sin extensiones** (pasos abajo).

| Página       | Perfil     | Rendimiento | Accesibilidad | Buenas prácticas | SEO                   | Informe                                    |
| ------------ | ---------- | ----------- | ------------- | ---------------- | --------------------- | ------------------------------------------ |
| `/`          | Móvil      | **87** ⚠️   | 100           | 96               | 100                   | `home-mobile.html`                         |
| `/`          | Escritorio | 100         | 100           | 96               | 100                   | `home-desktop.html` (con error de captura) |
| `/comparar`  | Móvil      | **88** ⚠️   | 100           | 96               | 100                   | `comparar-mobile.html`                     |
| `/comparar`  | Escritorio | 100         | 100           | 96               | 100                   | `comparar-desktop.html`                    |
| `/historial` | Móvil      | **83** ⚠️   | 100           | 96               | **63** ⚠️ → corregido | `simular-mobile.html`                      |
| `/historial` | Escritorio | 99          | 100           | 96               | **63** ⚠️ → corregido | `simular-desktop.html`                     |

> Los archivos `simular-*.html` son en realidad de `/historial` (lo dice su URL); se les cambiará el nombre al repetir la medición.

### Qué dicen los informes

1. **Accesibilidad 100 en las 6 mediciones y SEO 100 en `/` y `/comparar`**: cumplen con holgura. Buenas prácticas 96 cumple (≥ 95).
2. **Rendimiento móvil 83–88: por debajo de la meta (≥ 90).** La causa principal es el **TBT (460–680 ms)**, y el detalle del informe indica que **la mayor tarea larga (395 ms) y el mayor tiempo de ejecución de JavaScript pertenecen a una extensión de Chrome** (`frame.bundle.js`, `trustedtypes-strip.bundle.js`), no a la aplicación. Las tareas largas propias son de 126 ms y 113 ms. Los demás indicadores sí cumplen: **LCP 1,7–1,9 s** (≤ 2,5 s), **CLS 0** y FCP 0,8–0,9 s. Por eso la cifra de rendimiento móvil no es fiable hasta repetirla sin extensiones.
3. **SEO 63 en `/historial`: era mío.** La página tenía `noindex` (por ser personal) y la auditoría `is-crawlable` falla. El enunciado exige SEO ≥ 95 en las tres páginas, así que se **quitó el `noindex`** (la página sigue fuera del `sitemap.xml`). Requiere volver a desplegar y medir.
4. **Buenas prácticas 96, no 100:** la única auditoría que no pasa es «Issues in the Issues panel» (tipo _Content security policy_, sin detalle). Probablemente viene de la misma extensión (_trusted types_); si persiste en incógnito, se investiga.
5. **Escritorio:** rendimiento 99–100, LCP 0,4 s, CLS 0,004–0,039 (≤ 0,1).
6. JavaScript sin usar: ≈ 28 kB (39 %) en uno de los trozos de React/Next. No es accionable sin quitar el framework.

### Cómo repetir la medición (en incógnito)

1. Abrir una **ventana de incógnito** y comprobar que las extensiones están desactivadas (o usar un perfil de Chrome sin extensiones).
2. Para cada página: DevTools → **Lighthouse** → modo **Navegación** → marcar las 4 categorías → **Móvil** y luego **Escritorio**.
3. Guardar cada informe (⋮ → «Guardar como HTML») en `calidad/lighthouse/` con estos nombres: `inicio-movil.html`, `inicio-escritorio.html`, `comparar-movil.html`, `comparar-escritorio.html`, `historial-movil.html`, `historial-escritorio.html`, y borrar los anteriores.
4. Hacerlo **después de volver a desplegar** (para incluir la corrección de SEO).
5. También conviene pasar la dirección por [PageSpeed Insights](https://pagespeed.web.dev) y guardar una captura.

Este taller no tiene inicio de sesión, por eso no se pide la página con sesión iniciada. Lighthouse no mide INP: usa TBT como aproximación (ver [§5](#5-core-web-vitals)).

## 3. Responsive: 360 · 768 · 1024 px

✅ **Medido en Chromium real**, sobre la compilación de producción, el 2026-11-21.
Reproducir: `npm run test:e2e` (pruebas) y `npm run e2e:capturas` (capturas).

| Comprobación                                                                                              | Resultado                               |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| La página no se desplaza horizontalmente en 320, 360, 640 (≈ zoom 200 %), 768 y 1024 px, en las 7 páginas | Cumple (35 pruebas)                     |
| A 360 px solo la tabla se desplaza, dentro de su recuadro, que se alcanza con el teclado                  | Cumple                                  |
| 360 px una columna · 768 px dos columnas · 1024 px formulario junto al resumen                            | Cumple                                  |
| A 1024 px el formulario no invade la columna del resumen                                                  | Cumple (tras una corrección, ver abajo) |
| Botones y enlaces ≥ 44×44 px en móvil                                                                     | Cumple                                  |
| Texto base ≥ 16 px                                                                                        | Cumple                                  |

**Capturas** (página completa):

| Página                    | 360 px                                    | 768 px                                    | 1024 px                                     |
| ------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| Inicio                    | [360](calidad/capturas/inicio-360.png)    | [768](calidad/capturas/inicio-768.png)    | [1024](calidad/capturas/inicio-1024.png)    |
| Con resultado y tabla     | [360](calidad/capturas/resultado-360.png) | [768](calidad/capturas/resultado-768.png) | [1024](calidad/capturas/resultado-1024.png) |
| Con errores de validación | [360](calidad/capturas/errores-360.png)   | [768](calidad/capturas/errores-768.png)   | [1024](calidad/capturas/errores-1024.png)   |
| Comparar                  | [360](calidad/capturas/comparar-360.png)  | [768](calidad/capturas/comparar-768.png)  | [1024](calidad/capturas/comparar-1024.png)  |
| Historial                 | [360](calidad/capturas/historial-360.png) | [768](calidad/capturas/historial-768.png) | [1024](calidad/capturas/historial-1024.png) |

**Capturas de los temas oscuro y de alto contraste** (reto 2):

| Página                | Modo oscuro                                                                                           | Alto contraste (claro)                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Con resultado y tabla | [360](calidad/capturas/resultado-oscuro-360.png) · [1024](calidad/capturas/resultado-oscuro-1024.png) | [360](calidad/capturas/resultado-alto-contraste-360.png) · [1024](calidad/capturas/resultado-alto-contraste-1024.png) |
| Comparar              | [360](calidad/capturas/comparar-oscuro-360.png) · [1024](calidad/capturas/comparar-oscuro-1024.png)   | [360](calidad/capturas/comparar-alto-contraste-360.png) · [1024](calidad/capturas/comparar-alto-contraste-1024.png)   |

**Defecto encontrado y corregido gracias a las capturas:** a 1024 px los campos del formulario se salían de su columna y tapaban el resumen (los campos de texto no se encogían en una cuadrícula de `1fr`). Se escribió primero una prueba que lo reproducía, falló, y se corrigió con `minmax(0, 1fr)`, `width: 100%` y `min-width: 0`.

⏳ **Pendiente:**

- [ ] Probar en **un teléfono real** (vertical y horizontal) y anotar modelo, navegador y fecha: TODO
- [ ] Revisar el **zoom al 200 %** a mano en el navegador de escritorio: TODO

## 4. Accesibilidad (WCAG 2.2 AA)

### Automatizada ✅ (2026-11-21)

| Herramienta                                   | Cobertura                                                                                                                                                                                         | Resultado                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| axe-core dentro de Vitest + Testing Library   | Simulador (vacío, con resultado de 360 cuotas, con errores), formulario enviado vacío, comparador, historial vacío y con datos, navegación                                                        | 0 violaciones. Una prueba de control inserta una imagen sin `alt` y comprueba que axe la detecta |
| axe en Chromium real (`@axe-core/playwright`) | 7 páginas × 4 paletas (clara, oscura y las dos de alto contraste) × 360 y 1024 px, con reglas de WCAG 2.0 a 2.2 AA y buenas prácticas, **incluido el contraste real** y reglas de página completa | 0 violaciones (56 pruebas)                                                                       |
| Contraste (`tests/contraste.test.ts`)         | Colores leídos de `globals.css` en las 4 paletas                                                                                                                                                  | Texto ≥ 4,5:1 (≥ 7:1 en alto contraste), bordes y foco ≥ 3:1 (≥ 4,5:1 en alto contraste)         |
| Teclado (Playwright)                          | «Saltar al contenido» es lo primero con Tab, se ve y mueve el foco al contenido; el formulario se completa solo con teclado; foco visible; foco al primer campo inválido                          | Cumple                                                                                           |

**Se comprobó que las pruebas detectan fallos** (no son un falso verde): al degradar a propósito un color, el contraste falló con «4,48:1, se exige 7:1» en Vitest y con `color-contrast (serious)` en axe dentro del navegador.

**Hallazgo corregido:** había dos regiones casi iguales («Tabla de amortización» en la `<section>` y en el recuadro desplazable). Se quitó el nombre de la `<section>`.

### Manual ⏳ (pendiente: lo que una prueba automática no puede decir)

| Comprobación                                         | Cómo                                                                                                                                                | Resultado | Fecha      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| axe DevTools sobre la URL de producción              | Extensión axe DevTools → Analizar, en `/`, `/comparar` y `/historial` (guardar captura en `calidad/evidencias/`)                                    | TODO      | TODO       |
| Validador HTML del W3C                               | [validator.w3.org](https://validator.w3.org) → «Validate by Direct Input» con el código fuente (Ctrl+U) de cada página                              | TODO      | TODO       |
| Recorrido solo con teclado                           | Tab/Shift+Tab/Enter/Espacio por las 3 páginas, sin ratón                                                                                            | TODO      | TODO       |
| Zoom al 200 %                                        | Ctrl + «+» hasta 200 % en una ventana de 1280 px: sin perder contenido ni funciones                                                                 | TODO      | TODO       |
| Reflow a 320 px                                      | DevTools en modo dispositivo con 320 px de ancho: sin scroll horizontal (la automática ya lo cubre)                                                 | TODO      | TODO       |
| **Lector de pantalla** (NVDA en Windows o VoiceOver) | Pasar por el formulario con un error, por una simulación («Simulación calculada: cuota de…» debe anunciarse), por la tabla y por «Borrar historial» | TODO      | TODO       |
| `prefers-reduced-motion`                             | Hay transiciones cortas (0,15 s, solo de color); se apagan con «reducir movimiento» (prueba de Playwright que comprueba ambos casos)                | ✅        | 2026-11-21 |

## 5. Core Web Vitals

⏳ **Pendiente: se mide sobre la URL de producción, en perfil móvil.**

La aplicación ya mide las métricas reales con `useReportWebVitals`: cada una se imprime en la consola del navegador como `[web-vitals] LCP 1200 ms ✓ (meta ≤ 2500 ms)` y se acumula en `window.__webVitals`.

**Cómo medirlas:**

1. Abrir la URL de producción con DevTools → Consola.
2. Interactuar con la página: escribir en los campos, pulsar «Simular», paginar la tabla (el INP solo existe si hay interacciones).
3. Copiar el resultado con `JSON.stringify(window.__webVitals)`.
4. Apoyarse además en PageSpeed Insights (datos de laboratorio y, si hay tráfico, de usuarios reales).

| Métrica      | Meta (percentil 75) | Antes | Después | Qué se hizo para mejorarla |
| ------------ | ------------------- | ----- | ------- | -------------------------- |
| LCP          | ≤ 2,5 s             | TODO  | TODO    | TODO                       |
| INP          | ≤ 200 ms            | TODO  | TODO    | TODO                       |
| CLS          | ≤ 0,1               | TODO  | TODO    | TODO                       |
| FCP (apoyo)  | ≤ 1,8 s             | TODO  | TODO    | TODO                       |
| TTFB (apoyo) | ≤ 0,8 s             | TODO  | TODO    | TODO                       |

> Si la primera medición ya cumple, «Antes» y «Después» pueden ser iguales; lo importante es explicar qué decisiones de diseño protegen la métrica (por ejemplo: páginas estáticas, sin imágenes, una sola fuente, sin librerías pesadas, el recuadro de la tabla con tamaño reservado para no mover el diseño).

## 6. Peso de la página

✅ **Medido el 2026-11-21 sobre la compilación local** (gzip, aproximado a lo transferido). Se midió leyendo el HTML generado en `.next` y sumando los archivos que carga.

| Ruta         | JavaScript | HTML   | CSS    | Fuente | Total aprox. |
| ------------ | ---------- | ------ | ------ | ------ | ------------ |
| `/`          | 181,9 kB   | 2,7 kB | 3,3 kB | 29 kB  | ≈ 217 kB     |
| `/comparar`  | 180,6 kB   | 2,8 kB | 3,3 kB | 29 kB  | ≈ 216 kB     |
| `/historial` | 179,7 kB   | 2,5 kB | 2,3 kB | 29 kB  | ≈ 214 kB     |

**Tras el rediseño** (2026-11-21, solo CSS: sin librerías, imágenes ni fuentes nuevas) el CSS subió ≈ 0,9 kB comprimidos y el JavaScript no cambió, así que la meta de 200 kB sigue cumpliéndose.

- Meta de JavaScript ≤ 200 kB: **cumple** con ≈ 18 kB de margen. Los tres trozos más grandes (70 + 44 + 39 kB) son React y Next; el código propio es una parte pequeña.
- Meta de página ≤ 1 MB: cumple con mucho margen.
- No se cumple el reto «presupuesto estricto ≤ 120 kB», por eso no se eligió como reto.

⏳ **Pendiente:** repetir con DevTools → **Red** (sin caché, «Desactivar caché») sobre la URL de producción y anotar «transferido» de JS y total: TODO. Vercel sirve con Brotli, que suele ser menor que gzip.

## 7. HTML semántico y buenas prácticas

| Punto                                                                                                               | Evidencia                                                                                                                                                                                                                                                          | Estado                                |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Landmarks `header`, `nav`, `main`, `footer`; `lang="es"`                                                            | `src/app/layout.tsx`; axe en Chromium valida los landmarks de página completa                                                                                                                                                                                      | ✅                                    |
| Un solo `<h1>` por página y títulos sin saltar niveles                                                              | Prueba de Playwright («cada página tiene un título propio y un solo h1»)                                                                                                                                                                                           | ✅                                    |
| `<title>` único por ruta                                                                                            | Plantilla en el layout; prueba de Playwright                                                                                                                                                                                                                       | ✅                                    |
| Enlace «Saltar al contenido»                                                                                        | Prueba de Playwright                                                                                                                                                                                                                                               | ✅                                    |
| Cero `<div onClick>`: `<button>` para acciones, `<a>` para navegar                                                  | Todo el código usa elementos nativos; reglas `jsx-a11y` de ESLint sin advertencias                                                                                                                                                                                 | ✅                                    |
| Tabla de datos accesible                                                                                            | `<caption>`, `th scope="col"` y `th scope="row"`; pruebas de componente                                                                                                                                                                                            | ✅                                    |
| Formularios: `<label>`, error junto al campo con `aria-describedby` y `aria-invalid`, foco al primer campo inválido | Pruebas de componente y de Playwright                                                                                                                                                                                                                              | ✅                                    |
| `localStorage` dentro de `try/catch` y validando lo leído                                                           | `src/lib/historial.ts` y 14 pruebas                                                                                                                                                                                                                                | ✅                                    |
| ESLint sin advertencias                                                                                             | `npm run check`                                                                                                                                                                                                                                                    | ✅                                    |
| `robots.txt`, `sitemap.xml`, 404 propia, favicon, `description` y Open Graph                                        | Archivos generados leídos en `.next`; prueba de Playwright para la 404                                                                                                                                                                                             | ✅                                    |
| Cabeceras de seguridad                                                                                              | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, leídas del `routes-manifest.json`. No se incluye `Content-Security-Policy` (Next inserta scripts en línea y una política estricta exige nonces) | ✅ local · ⏳ confirmar en producción |
| HTTPS y sin contenido mixto                                                                                         | Lo da Vercel                                                                                                                                                                                                                                                       | ⏳ confirmar en DevTools → Seguridad  |
| `next/image` y `next/font`                                                                                          | No hay imágenes en la página; la fuente se carga con `next/font`                                                                                                                                                                                                   | ✅                                    |
| Validador HTML del W3C                                                                                              | Ver [§4](#4-accesibilidad-wcag-22-aa)                                                                                                                                                                                                                              | ⏳                                    |

### Verificado en producción (2026-11-21)

Lectura de https://simulador-de-prestamos-chi.vercel.app con una herramienta de lectura de páginas (convierte el HTML a texto: no muestra el `<head>` ni las cabeceras HTTP).

| Comprobación                                                     | Resultado                                                                                                                   |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/comparar` y `/historial` responden                        | HTTP 200, con su `<h1>` y su título («Comparar sistemas · Simulador de préstamos», «Historial · Simulador de préstamos») ✅ |
| `/robots.txt`                                                    | Trae `Sitemap: https://simulador-de-prestamos-chi.vercel.app/sitemap.xml` (dominio de Vercel, no `localhost`) ✅            |
| `/sitemap.xml`                                                   | Lista `/` y `/comparar` con el dominio de Vercel; `/historial` no aparece, como se diseñó ✅                                |
| Una dirección que no existe                                      | HTTP 404 ✅                                                                                                                 |
| «Saltar al contenido» y el menú                                  | Presentes en el HTML ✅                                                                                                     |
| `<meta description>`, Open Graph, ícono y cabeceras de seguridad | ⏳ No se pudieron ver con esa herramienta: confirmarlas en DevTools (Elementos y Red → Encabezados de respuesta)            |

**Observación sobre el HTML inicial:** la página sirve primero «Cargando simulador…» y el resultado aparece cuando el JavaScript lee la URL (`useSearchParams` dentro de `<Suspense>`). Es lo esperado en esta aplicación y no afecta al uso normal, pero conviene tenerlo presente al interpretar LCP en la sección 5 y explica que, sin JavaScript, solo se vea el mensaje de carga.

## 8. Retos de excelencia

Se eligieron tres (el mínimo exigido), cada uno con su evidencia y cómo reproducirla.

### Reto 1 · Pruebas de accesibilidad de componentes con axe dentro de Vitest y Testing Library ✅

- **Qué:** axe-core corre sobre los componentes renderizados con Testing Library y falla si hay una violación.
- **Evidencia:** `src/components/accesibilidad.test.tsx` y `tests/axe.ts`, 9 pruebas (incluye una de control que verifica que axe sí detecta una imagen sin `alt`).
- **Reproducir:** `npx vitest run src/components/accesibilidad.test.tsx`
- **Límite:** jsdom no calcula estilos reales, así que el contraste se verifica aparte (reto 2 y 3).

### Reto 2 · Modo oscuro y alto contraste sin romper el contraste en ningún tema ✅

- **Qué:** cuatro paletas (clara, oscura, clara con `prefers-contrast: more`, oscura con alto contraste), `color-scheme` y soporte de colores forzados de Windows.
- **Evidencia:** `src/app/globals.css` y `tests/contraste.test.ts` (96 pruebas, leen los colores del CSS). En alto contraste exige 7:1 en texto. Además, axe en Chromium revisa las 4 paletas (reto 3).
- **Reproducir:** `npx vitest run tests/contraste.test.ts`
- **Comprobación de que no es un falso verde:** se degradó un color a propósito y la prueba falló («4,48:1, se exige 7:1»).

### Reto 3 · Prueba en 3 anchos con Playwright: sin scroll horizontal y 0 violaciones de axe ✅

- **Qué:** 112 pruebas en Chromium real sobre la compilación de producción: layout en 320, 360, 640, 768 y 1024 px, axe en 4 paletas, teclado, descarga real del CSV, portapapeles, enlace compartible e historial.
- **Evidencia:** carpeta `e2e/`, `playwright.config.ts`, [`calidad/evidencias/e2e-playwright.txt`](calidad/evidencias/e2e-playwright.txt) y las capturas de [§3](#3-responsive-360--768--1024-px).
- **Reproducir:**

  ```bash
  npx playwright install chromium   # solo la primera vez
  npm run test:e2e
  npm run e2e:capturas
  ```

- **Hallazgos reales:** el desborde del formulario a 1024 px y las dos regiones duplicadas (ver [§3](#3-responsive-360--768--1024-px) y [§4](#4-accesibilidad-wcag-22-aa)).
- **Límites:** solo Chromium (no Firefox ni Safari); las preferencias se emulan (no es un lector de pantalla real ni un teléfono real).

## 9. Pruebas y cobertura

✅ 2026-11-21 · Reproducir: `npm run check` · [registro completo](calidad/evidencias/npm-run-check.txt)

```text
Test Files  22 passed (22)
     Tests  247 passed (247)

File          | % Stmts | % Branch | % Funcs | % Lines
All files     |   99.35 |     98.3 |     100 |   99.28
 comparar.ts  |     100 |    83.33 |     100 |     100
 historial.ts |   98.03 |      100 |     100 |   97.61
 webvitals.ts |     100 |    92.85 |     100 |     100
```

- El umbral está configurado en `vitest.config.mts` (80 % en líneas, funciones, ramas y sentencias, medido sobre `src/lib`): bajarlo rompe el `check`. Una prueba en `ia/contencion.test.ts` vigila que el umbral no se debilite.
- Los valores de referencia del enunciado (francés: cuota 885.621 y 627.448 de intereses; alemán: 616.772; ahorro de 10.676) están cubiertos en `src/lib/prestamo.test.ts` y `src/lib/comparar.test.ts`, y se comprueban de nuevo en pantalla con Playwright.

⏳ **Pendiente:** captura de pantalla de `npm run check` en tu terminal (la evidencia de texto ya está en `calidad/evidencias/`): TODO

## 10. Lo que no se hizo (límites honestos)

- **Medición en producción incompleta:** ya se confirmaron `robots.txt`, `sitemap.xml` y la 404 con el dominio real (§7), pero Lighthouse, Core Web Vitals, PageSpeed y las cabeceras HTTP siguen pendientes.
- **No hay `Content-Security-Policy`** (ver [§7](#7-html-semántico-y-buenas-prácticas)).
- **Sin imagen Open Graph** (solo título, descripción e idioma).
- **Sin pruebas con lector de pantalla ni teléfono real** (ver [§4](#4-accesibilidad-wcag-22-aa) y [§3](#3-responsive-360--768--1024-px)).
- **Solo Chromium** en las pruebas del navegador.
- **Sin menú colapsable en móvil:** con tres enlaces cortos caben en 360 px y se acomodan en varias líneas.
- **`/comparar` no guarda en el historial:** calcula dos sistemas a la vez; es una decisión documentada en la bitácora.
