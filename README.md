# Simulador de préstamos

Taller de recuperación R4. Simula un préstamo con el **sistema francés** (cuota fija) o el **sistema alemán** (abono fijo a capital), muestra el resumen y la tabla de amortización, y permite compararlos.

- **Dirección desplegada:** https://simulador-de-prestamos-chi.vercel.app
- **Enunciado:** [`R4-simulador-de-prestamos.md`](R4-simulador-de-prestamos.md)
- **Evidencias de calidad:** [`CALIDAD.md`](CALIDAD.md)
- **Uso de la IA:** [`ia/BITACORA.md`](ia/BITACORA.md) y [`ia/PRUEBAS-CONTENCION.md`](ia/PRUEBAS-CONTENCION.md)

## Qué hace

| Ruta         | Contenido                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/`          | Formulario de simulación, resumen (primera y última cuota, total pagado, total de intereses) y tabla de amortización paginada de 12 en 12 |
| `/comparar`  | La misma simulación con los dos sistemas lado a lado y cuánto se ahorra en intereses                                                      |
| `/historial` | Las últimas 10 simulaciones guardadas en este navegador                                                                                   |

- La simulación **vive en la URL**: `/?monto=10000000&tasa=12&plazo=12&sistema=frances`. Se puede compartir y se calcula sola al abrir el enlace. Con valores inválidos muestra el formulario con los errores, sin romperse.
- **Copiar enlace** y **Descargar CSV** (separador `;`, abre bien en Excel en español).
- Sin base de datos, sin Firebase y sin API externa: todo corre en el navegador.

### Datos de entrada

| Campo                    | Regla                                                 |
| ------------------------ | ----------------------------------------------------- |
| Monto                    | Entero en pesos entre 1.000.000 y 500.000.000         |
| Tasa efectiva anual (EA) | Entre 0 y 60 %, con hasta 2 decimales (acepta «12,5») |
| Plazo                    | Entero de 1 a 360 meses                               |
| Sistema                  | `frances` o `aleman`                                  |

## Requisitos

- [Node.js](https://nodejs.org) 22 (LTS) o superior
- Git

## Instalar y ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
```

## Comprobar y probar

```bash
npm run check      # tipos + ESLint sin advertencias + Prettier + pruebas con cobertura (≥ 80 %)
npm test           # solo las pruebas unitarias y de componentes (Vitest)
```

`npm run check` falla si baja la cobertura de la lógica de negocio (`src/lib`) del 80 %.

### Pruebas en un navegador real (Playwright)

Pruebas de layout en 3 anchos, accesibilidad con axe en 4 paletas y flujos completos. La primera vez hay que descargar el navegador:

```bash
npx playwright install chromium
npm run test:e2e         # compila y prueba la versión de producción
npm run e2e:capturas     # genera las capturas en calidad/capturas/
```

## Comandos

| Comando                       | Para qué sirve                                  |
| ----------------------------- | ----------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo                          |
| `npm run build` / `npm start` | Compilación y servidor de producción            |
| `npm run check`               | Tipos, ESLint, Prettier y pruebas con cobertura |
| `npm test`                    | Pruebas con Vitest                              |
| `npm run test:coverage`       | Pruebas con informe de cobertura                |
| `npm run test:e2e`            | Pruebas con Playwright                          |
| `npm run format`              | Da formato con Prettier                         |

## Cómo se calcula

- Tasa mensual: `i = (1 + EA/100)^(1/12) − 1`.
- **Francés:** `cuota = monto · i / (1 − (1 + i)^(−n))`. Con tasa 0, `monto / n`.
- **Alemán:** abono a capital fijo de `monto / n`; la cuota baja mes a mes.
- Todo en **pesos enteros** (`Math.round`), los intereses de cada mes son `Math.round(saldo · i)`, y la **última cuota** abona exactamente el saldo restante, así que el saldo final es 0.

Valores de referencia (10.000.000, EA 12 %, 12 meses): francés con cuota de $885.621 y $627.448 de intereses; alemán con $616.772 de intereses. El alemán ahorra $10.676.

## Estructura

```text
src/
  app/            rutas (/, /comparar, /historial), layout, robots, sitemap, 404
  components/     formulario, tabla, resumen, comparador, historial, navegación
  hooks/          useSimulacion (lee y valida la simulación de la URL)
  lib/            lógica pura: prestamo, validar, formato, url, csv, historial, comparar…
e2e/              pruebas de Playwright
tests/            ayudantes de pruebas (axe, contraste)
ia/               configuración de IA: pruebas de contención y bitácora
calidad/          capturas y evidencias de calidad
```

## Configuración de IA

Reglas del proyecto en [`AGENTS.md`](AGENTS.md) y permisos en [`.claude/settings.json`](.claude/settings.json) (no puede leer `.env` ni claves, no sale de la carpeta, y `git push`, instalar dependencias y `vercel` piden permiso).

## Despliegue

Se despliega en [Vercel](https://vercel.com) importando el repositorio con la configuración por defecto. No necesita variables de entorno: la dirección del sitio para `sitemap.xml` y `robots.txt` sale de `VERCEL_PROJECT_PRODUCTION_URL`, que Vercel entrega al compilar.
