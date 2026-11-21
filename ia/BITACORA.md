# Bitácora de uso de la IA

Formato de cada entrada: **propósito · evidencia · validación · decisión**.

## 1. Redacción de AGENTS.md

- **Propósito:** tener las reglas del proyecto para la IA (stack, comandos, estructura, sí/no).
- **Evidencia:** `AGENTS.md` (la IA escribió el borrador a partir del enunciado R4, sección 11).
- **Validación:** TODO: anotar qué leí y qué cambié yo.
- **Decisión:** TODO.

## 2. Permisos de seguridad (`.claude/settings.json`)

- **Propósito:** impedir leer `.env`/claves, salir de la carpeta y pedir permiso para push/install/vercel.
- **Evidencia:** `.claude/settings.json`, `ia/contencion.test.ts`, `ia/PRUEBAS-CONTENCION.md`.
- **Validación:** se probó en vivo. Leer `.env` y crearlo con Bash fue bloqueado. Leer
  `C:\Windows\win.ini` NO fue bloqueado: `Read(../**)` no cubre rutas absolutas.
- **Decisión:** se agregaron reglas con ruta absoluta (`//C:/...`). Quedan pendientes de
  verificar reiniciando la sesión (ver `PRUEBAS-CONTENCION.md`).

## 3. Script `npm run check` y cobertura

- **Propósito:** que tipos, ESLint, Prettier y pruebas se comprueben siempre, también en el código de la IA.
- **Evidencia:** `package.json` (scripts), `vitest.config.mts`.
- **Validación:** se puso un archivo sin pruebas en `src/lib/` y el check falló por cobertura 0 %.
- **Decisión:** umbral del 80 % se queda; `coverage/` se excluyó de ESLint y de Git.

## 4. Instalación de pruebas

- **Propósito:** instalar Vitest y Testing Library.
- **Evidencia:** la instalación del enunciado falló por `@types/node@20` (Vitest 5 pide ≥ 22).
- **Validación:** `npm test` y `tsc` pasan tras subir a `@types/node@22` (mi Node es 22).
- **Decisión:** aceptada la corrección.

## Casos en que rechacé o corregí a la IA (mínimo 3)

1. TODO
2. TODO
3. TODO

> Cada caso: qué propuso la IA, por qué lo rechacé o corregí, y qué hice en su lugar.
