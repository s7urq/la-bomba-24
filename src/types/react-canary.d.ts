// El App Router de Next 16 compila contra el React canary que trae adentro
// (next/dist/compiled/react), que sí exporta ViewTransition. El paquete `react`
// de la raíz es el 19.2.8 estable y no lo exporta: mirar ahí para decidir si la
// feature existe da un falso negativo.
/// <reference types="react/canary" />
