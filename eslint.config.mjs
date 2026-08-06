import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  // .agents y .claude son skills de terceros instaladas por el CLI `skills`:
  // son herramientas del entorno, no código de la app.
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "next-env.d.ts",
    ".agents/**",
    ".claude/**",
  ]),
]);
