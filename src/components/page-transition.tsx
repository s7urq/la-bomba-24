"use client";

import { ViewTransition, type ReactNode } from "react";

/**
 * Deslizamiento direccional entre pantallas. El tipo lo declara cada `Link` con
 * `transitionTypes`, así que "adelante" y "atrás" son decisiones de navegación
 * y no del componente.
 *
 * Va en cada `page.tsx` y nunca en el layout: los layouts persisten entre
 * navegaciones, así que ahí `enter` y `exit` no se disparan nunca.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
