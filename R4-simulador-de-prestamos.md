# Taller de recuperación R4 · Simulador de préstamos con tabla de amortización

> **Individual.** Este documento es lo único que necesita: trae el problema, el paso a paso, los criterios de aceptación y la forma de entrega. No se entrega código base.

**En una frase:** un simulador que calcula la cuota de un préstamo con dos sistemas de pago y muestra la tabla de amortización, con formularios validados y lógica probada.

---

## 1. Qué se evalúa

Este taller recupera lo visto antes del parcial (unidades 1 y 2 del curso). Para aprobarlo debe demostrar que puede:

| Competencia | Cómo se ve en este taller |
|---|---|
| HTML semántico, CSS responsivo y accesibilidad | Formulario con etiquetas y errores, tabla de datos accesible, tres anchos de pantalla |
| JavaScript moderno | Funciones puras, `reduce`, `Array.from`, `Intl.NumberFormat`, redondeo y casos límite |
| Formularios y validación | Formulario controlado, mensajes por campo, validación al salir del campo y al enviar |
| React | Componentes, `useState`, `useMemo`, un hook propio, estado derivado |
| Rutas y URL | La simulación vive en la URL (`/?monto=…&tasa=…&plazo=…`) y se puede compartir |
| Pruebas | Vitest con valores conocidos y React Testing Library para el formulario |
| Calidad y despliegue | Core Web Vitals, Lighthouse, responsive, WCAG 2.2 AA, retos de excelencia y evidencias en `calidad/` (sección 10); despliegue en Vercel |
| Uso responsable de la IA | Configuración propia en el primer commit, pruebas de contención y bitácora en `ia/` (sección 11) |

No hay base de datos, ni Firebase, ni API externa.

## 2. Reglas del taller

1. El trabajo es **individual**. Puede usar un asistente de IA, pero debe llevar una **bitácora** (`ia/BITACORA.md`, sección 11) y entender cada línea que entregue.
2. Historial de Git propio, con al menos **8 commits** que cuenten la historia del trabajo. El **primer commit** contiene la configuración de IA (sección 11).
3. Habrá una **sustentación de unos 10 minutos** con un cambio en vivo (por ejemplo, agregar un seguro mensual a la cuota o un periodo de gracia). Quien no pueda explicar su código no aprueba, aunque el simulador funcione.
4. Primero se cumplen todos los requisitos; después puede agregar mejoras.

## 3. Preparación (paso a paso)

1. Compruebe Node.js (versión LTS) y Git:

   ```bash
   node --version
   git --version
   ```

   ✔ Ambos muestran una versión.

2. Cree el proyecto (TypeScript, ESLint y App Router):

   ```bash
   npx create-next-app@latest r4-simulador-prestamos --ts --app --eslint --src-dir
   cd r4-simulador-prestamos
   ```

3. Instale las pruebas:

   ```bash
   npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
   ```

4. Cree `vitest.config.ts` en la raíz:

   ```ts
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     plugins: [react()],
     test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"], globals: true },
   });
   ```

5. Cree `tests/setup.ts` con `import "@testing-library/jest-dom/vitest";` y agregue `"test": "vitest run"` en los `"scripts"`.

   ✔ `npm run dev` abre la página de ejemplo.

6. Cree el repositorio en GitHub. **Antes de pedirle nada a la IA**, construya su configuración de IA (sección 11) y haga con ella el **primer commit**.

## 4. Qué debe construir

### 4.1 Páginas

| Ruta | Contenido |
|---|---|
| `/` | Formulario de simulación, resumen de resultados y tabla de amortización |
| `/comparar` | La misma simulación con los **dos sistemas** lado a lado |
| `/historial` | Últimas 10 simulaciones guardadas en el navegador |

`layout.tsx` con `<header>`, `<nav>`, `<main>`, `<footer>` y `lang="es"`.

### 4.2 Datos de entrada y validación

| Campo | Regla |
|---|---|
| Monto | Entero en pesos entre 1.000.000 y 500.000.000 |
| Tasa efectiva anual (EA) | Número entre 0 y 60, con hasta 2 decimales (se escribe como porcentaje, por ejemplo `12`) |
| Plazo | Entero de 1 a 360 meses |
| Sistema | `frances` (cuota fija) o `aleman` (abono fijo a capital) |

Cada campo muestra su error **junto al campo** (con `aria-describedby` y `aria-invalid`), en español y diciendo qué hacer («El plazo debe estar entre 1 y 360 meses»). Se valida al salir del campo (`onBlur`) y al enviar; el botón **no** se deshabilita en silencio: al enviar con errores, el foco pasa al primer campo inválido.

### 4.3 Requisitos funcionales

- **RF-01** Calcular la **tasa mensual** a partir de la EA: `i = (1 + EA/100)^(1/12) − 1`.
- **RF-02** **Sistema francés** (cuota fija): `cuota = monto · i / (1 − (1 + i)^(−n))`. Si la tasa es 0, la cuota es `monto / n` (evite la división por cero).
- **RF-03** **Sistema alemán** (abono constante a capital): el abono a capital de cada mes es `monto / n` y la cuota baja mes a mes porque los intereses se calculan sobre el saldo.
- **RF-04** **Tabla de amortización** con las columnas: n.º de cuota, cuota, intereses, abono a capital y saldo. Se muestran 12 filas por página, con paginación o con `<details>` por año.
- **RF-05** **Resumen:** primera cuota, última cuota, total pagado y total de intereses.
- **RF-06** La simulación queda en la URL; al abrir un enlace con valores válidos se calcula sola, y con valores inválidos se muestra el formulario con los errores, sin romperse.
- **RF-07** Botón **«Copiar enlace»** (Clipboard API, con alternativa si no está disponible: seleccionar el texto de un campo) y **«Descargar CSV»** de la tabla (con `Blob` y `URL.createObjectURL`).
- **RF-08** Cada simulación calculada se guarda en `localStorage` (máximo 10, la más reciente primero) y se muestra en `/historial` con un enlace para repetirla y un botón para borrar el historial.
- **RF-09** `/comparar` muestra cuánto se ahorra en intereses con un sistema respecto del otro, con una frase («El sistema alemán paga $10.676 menos en intereses»).

## 5. Reglas de cálculo (para que todos obtengan lo mismo)

Para que las pruebas den resultados idénticos, siga estas reglas de redondeo:

1. Trabaje con **pesos enteros**. Redondee con `Math.round`.
2. **Intereses de cada mes** = `Math.round(saldo · i)`.
3. **Francés:** la cuota fija es `Math.round(cuotaTeórica)`. Abono a capital = cuota − intereses.
4. **Alemán:** el abono a capital es `Math.round(monto / n)`.
5. **En la última cuota** el abono a capital es igual al saldo que queda, de modo que el saldo final es **exactamente 0** (la última cuota puede diferir unos pesos de las demás).

**Valor de referencia para verificar su código** (francés, monto 10.000.000, EA 12 %, 12 meses):

| Cuota | Valor |
|---|---|
| Tasa mensual `i` | ≈ 0,0094888 |
| Cuota fija | 885.621 |
| Cuota 1 | 885.621 = 94.888 de intereses + 790.733 de capital; saldo 9.209.267 |
| Cuota 2 | 885.621 = 87.385 de intereses + 798.236 de capital; saldo 8.411.031 |
| Cuota 12 (última) | 885.617 = 8.324 de intereses + 877.293 de capital; saldo 0 |
| Total pagado | 10.627.448 |
| Total de intereses | 627.448 |

**Sistema alemán** con los mismos datos y las mismas reglas de redondeo:

| Cuota | Valor |
|---|---|
| Cuota 1 | 928.221 = 94.888 de intereses + 833.333 de capital; saldo 9.166.667 |
| Cuota 12 (última) | 841.244 = 7.907 de intereses + 833.337 de capital; saldo 0 |
| Total pagado | 10.616.772 |
| Total de intereses | 616.772 |

Por eso el ahorro del sistema alemán frente al francés en este caso es de **$10.676** (627.448 − 616.772), la cifra del ejemplo del RF-09.

## 6. Pasos sugeridos

Haga un commit al terminar cada paso.

1. **Lógica pura** en `src/lib/prestamo.ts`, sin React: `tasaMensual(ea)`, `cuotaFrancesa(monto, i, n)`, `amortizar({ monto, ea, plazo, sistema })` que devuelve `{ filas, resumen }`. Defina los tipos `Fila` (`numero`, `cuota`, `intereses`, `capital`, `saldo`) y `Resumen`.
   ✔ Con los valores de la sección 5 su función da las mismas cifras.
2. **Validación** en `src/lib/validar.ts`: una función `validar(entrada)` que recibe los textos del formulario y devuelve `{ valor, errores }` (un mensaje por campo). Acepta la coma decimal («12,5») y descarta letras y espacios.
3. **Formato** en `src/lib/formato.ts`: `pesos(n)` con `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })` y `porcentaje(n)`.
4. **Formulario controlado** (`useState` por campo o un solo objeto) que escribe en la URL con `router.replace` al enviar.
5. **Resultado derivado:** calcule la tabla con `useMemo` a partir de los valores de la URL; no la guarde en un estado aparte (evita desincronización).
6. **Tabla accesible** con `<table>`, `<caption>`, `<th scope="col">` y `<th scope="row">` para el número de cuota, y alineación a la derecha de los números. En pantallas de 360 px la tabla se desplaza **dentro de su propio contenedor** (`overflow-x: auto`, con `tabindex="0"` y `role="region"` y `aria-label`), no la página.
7. **CSV y copiar enlace.** El CSV usa `;` como separador (el Excel en español lo espera) y se descarga con un enlace `download`, liberando la URL con `URL.revokeObjectURL`.
8. **Historial** con `localStorage` dentro de `try/catch` y validando lo que se lee.
9. **`/comparar`**, pruebas, revisión de accesibilidad y bitácora.

## 7. Interfaz, accesibilidad y diseño responsivo

- **HTML semántico:** un solo `<h1>` por página; el formulario en un `<form>` con `<label>` por campo; los resultados en una región con `aria-live="polite"` que anuncie «Simulación calculada: cuota de $885.621».
- **Campos:** `inputMode="numeric"` o `"decimal"`, `autocomplete="off"` donde corresponda; los números con separador de miles al mostrarlos, **no** mientras se escribe.
- **Teclado:** todo se usa con teclado, foco visible, enlace «Saltar al contenido». Contraste mínimo 4,5:1.
- **Responsivo:** en **360 px** el formulario ocupa una columna; en **768 px** dos; en **1024 px** el formulario queda a un lado del resumen. Sin desplazamiento horizontal en la página y con zoom al 200 %.
- **Estados:** antes de calcular, un mensaje de ayuda; sin historial, un estado vacío.
- **Metas medibles:** Core Web Vitals, Lighthouse, responsive y accesibilidad tienen cifras concretas en la **sección 10**.

## 8. Criterios de aceptación y pruebas mínimas

**Criterios** (se revisan en vivo):

1. Dados 10.000.000, EA 12 % y 12 meses en sistema francés, la cuota es **$885.621** y el total de intereses **$627.448**.
2. Dada una tasa de 0 %, la cuota es el monto dividido entre el plazo y no aparece `NaN` ni `Infinity`.
3. Dado un plazo de 400, veo el error junto al campo y el foco va a ese campo; no se calcula nada.
4. Dado el enlace copiado, al abrirlo en otra pestaña veo la misma simulación.
5. Dado un enlace con `?monto=abc`, veo el formulario con el error y la página no se rompe.
6. Dada una tabla de 360 cuotas, la página sigue siendo fluida (solo se dibujan 12 filas a la vez).
7. En 360 px la página no se desplaza horizontalmente; solo la tabla lo hace dentro de su recuadro.

**Pruebas con Vitest** (`npm test`; al menos las siguientes):

- Valores de referencia de la sección 5, en los dos sistemas (cuota 1, cuota 12, total de intereses).
- En ambos sistemas: la suma de los abonos a capital es igual al monto y el saldo final es 0.
- Tasa 0 en el sistema francés: sin `NaN`.
- `validar`: acepta «12,5», rechaza «abc», rechaza un plazo de 0 y uno de 361.
- `pesos(1234567)` contiene «1.234.567» (compare ignorando el símbolo y el espacio especial).
- React Testing Library: al enviar el formulario vacío aparecen los errores y el foco queda en el primer campo inválido; al enviar uno válido aparece la cuota.

Busque los elementos por rol y etiqueta, no por clases de CSS.

Además, `npm run check` (tipos, ESLint sin advertencias, Prettier y pruebas) debe pasar y la **cobertura de la lógica de negocio** debe ser de 80 % o más (sección 11).

## 9. Despliegue y entrega

### 9.1 Despliegue en Vercel (paso a paso)

Las metas de calidad (sección 10) se miden sobre la **dirección de producción**, por eso el taller se despliega. No necesita variables de entorno ni cuentas de otros servicios.

1. Suba el repositorio a GitHub **usted mismo** (`git push`; no se lo pida a la IA).
2. Entre a [vercel.com](https://vercel.com), inicie sesión con GitHub y elija **Add New… → Project**.
3. Importe el repositorio `r4-simulador-prestamos`. Vercel detecta Next.js solo; deje la configuración por defecto y pulse **Deploy**.
4. ✔ Al terminar, abra la dirección `https://….vercel.app` y recorra todas las páginas. Cada `git push` a la rama principal vuelve a desplegar.
5. Mida Lighthouse y PageSpeed Insights **sobre esa dirección**, no sobre `localhost`.

### 9.2 Qué se entrega

- Repositorio de GitHub con historial de commits propio, con la **configuración de IA en el primer commit**.
- La **dirección desplegada** en el `README`, junto con las instrucciones para instalar, ejecutar (`npm run dev`), comprobar (`npm run check`) y probar (`npm test`).
- Carpeta **`calidad/`** y archivo **`CALIDAD.md`** con las evidencias de la sección 10 (informes de Lighthouse, capturas en 360/768/1024 px, axe, validador HTML, tabla LCP/INP/CLS, resultado de `npm run check`, retos elegidos).
- Carpeta **`ia/`** con las pruebas de contención de la configuración de IA y la bitácora `ia/BITACORA.md` (sección 11).
- Estar listo para **modificar el taller en vivo** en la sustentación.

**Lista de verificación final:**

- [ ] La dirección de Vercel abre y todas las páginas funcionan.
- [ ] `npm run check` pasa y la cobertura de la lógica de negocio es de 80 % o más.
- [ ] Ningún secreto en Git (aunque este taller no use claves: la configuración de IA debe impedir que la IA las lea).
- [ ] La configuración de IA está en el primer commit y las pruebas de contención están en `ia/`.
- [ ] `calidad/` y `CALIDAD.md` completos; al menos 3 retos de excelencia con evidencia.
- [ ] `ia/BITACORA.md` con al menos 3 casos en que rechazó o corrigió a la IA.

## 10. Metas de calidad y retos de excelencia

El taller es pequeño para que haya tiempo de hacerlo **bien**: la meta no es solo que funcione, sino que se vea, se sienta y se mida como un producto profesional. Estas metas valen para **todos** los talleres de recuperación y son las mismas que se exigen en los proyectos finales.

### 1 · Rendimiento y Core Web Vitals

_Se miden en la URL de producción (Vercel), perfil móvil._

- **LCP ≤ 2,5 s** (carga del contenido principal).
- **INP ≤ 200 ms** (respuesta a cada interacción).
- **CLS ≤ 0,1** (sin saltos de diseño).
- Se evalúan al percentil 75. De apoyo (orientativo): FCP ≤ 1,8 s, TTFB ≤ 0,8 s, TBT ≤ 200 ms.
- **Lighthouse móvil:** Rendimiento ≥ 90 · Accesibilidad ≥ 95 · Buenas prácticas ≥ 95 · SEO ≥ 95.
- Presupuesto: JavaScript transferido ≤ 200 kB y página inicial ≤ 1 MB (DevTools → Red, sin caché).
- **Cómo medir:** Lighthouse, PageSpeed Insights y `useReportWebVitals` (`next/web-vitals`). Lighthouse **no mide INP** en laboratorio (usa TBT como aproximación): mídalo interactuando con la página y con las métricas reales.

### 2 · Responsive: 360 · 768 · 1024 px

_Diseño mobile-first, probado en los tres anchos._

- **360 px (móvil):** una columna, sin scroll horizontal, objetivos táctiles ≥ 44×44 px (mínimo WCAG 24×24), texto ≥ 16 px, menú colapsable accesible por teclado.
- **768 px (tableta):** dos columnas donde tenga sentido, navegación visible o menú con el foco bien gestionado, formularios en dos columnas.
- **1024 px (escritorio):** hasta tres columnas, líneas de texto de ≤ 70 caracteres (`max-width: 70ch`), navegación completa.
- En los tres: sin recortes ni solapes, imágenes con `sizes` (`next/image`), `rem`, `clamp()`, Grid y Flexbox, **sin anchos fijos en píxeles**.
- Zoom al 200 % sin perder contenido ni funciones; **reflow** sin scroll horizontal a 320 px (WCAG 1.4.10).
- Vertical y horizontal. Probar en DevTools (modo dispositivo) **y en un teléfono real**.

### 3 · Accesibilidad (WCAG 2.2 nivel AA)

_Lo automático detecta solo una parte: también se revisa a mano._

- Todo se usa **solo con teclado**, en orden lógico y sin trampas; enlace **«Saltar al contenido»**.
- **Foco visible** (nunca `outline: none` sin sustituto) y no tapado por cabeceras fijas (2.4.11).
- Contraste ≥ **4,5:1** en texto y ≥ **3:1** en controles y gráficos (1.4.3, 1.4.11). No usar solo el color para informar.
- Objetivos táctiles ≥ 24×24 px (2.5.8).
- Formularios: `<label>`, errores en texto junto al campo y anunciados (`aria-describedby`, `aria-live`), `autocomplete` (1.3.5) y sin pedir lo ya escrito (3.3.7).
- `alt` útil en imágenes (vacío si es decorativa), `lang="es"`, `<title>` único por ruta; cambios de estado y de ruta anunciados a lectores de pantalla.
- Respetar `prefers-reduced-motion` y `prefers-color-scheme`.
- **Verificar con:** Lighthouse + axe DevTools, recorrido solo con teclado y **una pasada con lector de pantalla** (NVDA en Windows o VoiceOver).

### 4 · HTML semántico y buenas prácticas

_Hacer bien lo básico antes de agregar funciones._

- Landmarks `<header>`, `<nav>`, `<main>`, `<footer>`; **un solo `<h1>`** y títulos sin saltar niveles.
- El elemento correcto: `<button>` para acciones y `<a>` para navegar; `<ul>`/`<ol>` para listas; `<table>` solo para datos; `<time>`, `<figure>`, `<dialog>`, `<details>`.
- **Cero `<div onClick>`**: nada interactivo sin elemento nativo; ARIA solo cuando no exista el nativo.
- Sin errores en el validador HTML del W3C ni en la consola; ESLint sin advertencias (reglas `jsx-a11y` de Next.js).
- CSS mobile-first, con variables, sin `!important` innecesario y con una convención consistente (módulos CSS o BEM).
- `next/image` con `width` y `height` (evita CLS) y `next/font` para tipografías; carga diferida de lo que no se ve.
- SEO básico: `<title>`, `description`, Open Graph, `robots`, `sitemap`, página 404 propia y favicon.
- HTTPS, sin contenido mixto y con cabeceras de seguridad.

### 5 · Retos de excelencia

_Elija al menos 3 y justifíquelos con evidencia._

- **100 en las cuatro categorías** de Lighthouse (móvil, producción) en las tres páginas de la evidencia.
- **LCP ≤ 1,8 s y CLS = 0** en producción (percentil 75), con el antes y el después de lo que hizo para lograrlo.
- **Prueba en 3 anchos** con Playwright (360/768/1024): sin scroll horizontal y 0 violaciones de axe (`@axe-core/playwright`).
- **Pruebas de accesibilidad de componentes** con axe dentro de Vitest y React Testing Library.
- **Funciona sin JavaScript** en el flujo principal (mejora progresiva: formularios con `action`, enlaces reales).
- **Modo oscuro y alto contraste** sin romper el contraste en ningún tema.
- **Presupuesto estricto:** JavaScript transferido ≤ 120 kB, con `next/dynamic` para lo pesado.
- **Navegación accesible:** foco movido y título anunciado en cada cambio de ruta, probado con lector de pantalla.
- **Impresión** (`@media print`) y **SEO avanzado** (JSON-LD, `sitemap`, imágenes Open Graph).
- **Español e inglés** con `lang` correcto y formatos `Intl`.

### 6 · Evidencias a entregar

_Carpeta `calidad/` del repositorio y un archivo `CALIDAD.md`._

- Informes de Lighthouse (móvil y escritorio) de tres páginas del taller: `/`, `/comparar` y `/historial`. Este taller no tiene inicio de sesión, por eso no se pide la página con sesión iniciada.
- Capturas de las páginas principales en **360, 768 y 1024 px**.
- Resultado de axe y del validador HTML, y la lista de comprobación manual (teclado, zoom 200 %, lector de pantalla) con fecha.
- Tabla de **LCP, INP y CLS** y qué hizo para mejorarlas (antes y después).
- Captura del resultado de `npm run check`.
- Los retos elegidos, cada uno con su evidencia y cómo reproducirla.
- Todo debe poder **demostrarse en vivo** en la sustentación.

## 11. Configuración de la IA del taller (reto adicional)

Antes de usar un asistente de IA en este taller, el estudiante debe **diseñar y configurar su propia configuración de IA**. No se entrega una configuración hecha: pensarla, construirla y comprobarla es parte del reto. Los requisitos detallados y cómo se evalúan se explican en clase (hoja «Configuración de IA»), y son los mismos que se exigen en los proyectos finales. La configuración queda versionada en el **primer commit** del repositorio, **antes** de generar código, y debe cubrir:

- **Reglas del proyecto** para la IA: un archivo de instrucciones propio (`AGENTS.md`, de 100 líneas o menos, con el stack, los comandos, la estructura, lo que sí y lo que no).
- **Restricciones de seguridad:** la IA **no puede leer** `.env`, claves ni credenciales, **no puede salir de la carpeta** del proyecto y las acciones con efecto fuera de su máquina (`git push`, instalar dependencias, `vercel`) piden permiso.
- **Reglas de calidad del código** que se comprueban de forma automática, también sobre el código que escriba la IA: un script `npm run check` que ejecute el chequeo de tipos, ESLint sin advertencias, Prettier y las pruebas. Las pruebas se miden con `vitest run --coverage` (instale `npm i -D @vitest/coverage-v8`) y la **cobertura de la lógica de negocio** debe ser de **80 % o más**, con el umbral configurado para que bajarlo rompa el `check`.
- **Evidencia:** pruebas propias que demuestren que las restricciones funcionan, guardadas en la carpeta `ia/`, y la **bitácora** `ia/BITACORA.md` (propósito, evidencia, validación y decisión de cada uso de la IA, más **al menos 3 casos** en que usted rechazó o corrigió lo que propuso la IA). No comparta contraseñas, claves ni datos personales con la IA.

Todo debe poder **demostrarse en vivo** en la sustentación.

## 12. Rúbrica

| Criterio | Peso |
|---|---|
| Cálculos correctos y casos límite (valores de referencia, tasa 0) | 20 % |
| Formulario controlado, validación y mensajes accesibles | 15 % |
| React: estado derivado, `useMemo`, componentes y URL | 10 % |
| Metas de calidad y evidencias (accesibilidad, responsivo, Core Web Vitals, Lighthouse) | 20 % |
| Pruebas y `npm run check` | 10 % |
| Configuración de IA y pruebas de contención | 10 % |
| Sustentación en vivo (explicar y modificar) | 10 % |
| Git y bitácora de IA | 5 % |
