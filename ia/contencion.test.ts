import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Pruebas de contención: comprueban que la configuración de la IA
// (.claude/settings.json) mantiene las restricciones exigidas por el taller.
// Si alguien las quita o las debilita, `npm run check` falla.

type Permisos = { allow: string[]; ask: string[]; deny: string[] };

const raiz = resolve(__dirname, "..");
const permisos: Permisos = JSON.parse(
  readFileSync(resolve(raiz, ".claude/settings.json"), "utf8"),
).permissions;

describe("contención de la IA", () => {
  it("no puede leer .env, claves ni credenciales", () => {
    for (const regla of ["Read(./.env)", "Read(**/.env.*)", "Read(**/*.pem)", "Read(**/*.key)"]) {
      expect(permisos.deny).toContain(regla);
    }
  });

  it("no puede escribir .env", () => {
    expect(permisos.deny).toContain("Edit(./.env*)");
    expect(permisos.deny).toContain("Write(./.env*)");
  });

  it("no puede salir de la carpeta del proyecto (rutas relativas)", () => {
    for (const regla of ["Read(../**)", "Edit(../**)", "Write(../**)", "Bash(cd ..*)"]) {
      expect(permisos.deny).toContain(regla);
    }
  });

  it("pide permiso para push, instalar dependencias y vercel", () => {
    for (const regla of [
      "Bash(git push *)",
      "Bash(npm install *)",
      "Bash(npm i *)",
      "Bash(vercel *)",
    ]) {
      expect(permisos.ask).toContain(regla);
    }
  });

  it("no deja pasar sin preguntar lo que está en 'ask' o 'deny'", () => {
    const permitidas = permisos.allow.join(" ");
    expect(permitidas).not.toMatch(/push|vercel|install|\.env/);
  });

  it("el umbral de cobertura sigue en 80 %", () => {
    const config = readFileSync(resolve(raiz, "vitest.config.mts"), "utf8");
    expect(config).toMatch(/lines:\s*80/);
    expect(config).toMatch(/branches:\s*80/);
  });

  it("AGENTS.md existe y tiene 100 líneas o menos", () => {
    const lineas = readFileSync(resolve(raiz, "AGENTS.md"), "utf8").split("\n").length;
    expect(lineas).toBeLessThanOrEqual(100);
  });
});
