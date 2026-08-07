export const CATEGORY_SLUGS = [
  "tragos",
  "alfajores",
  "cerveza",
  "fumar",
  "sandwiches",
  "fiambres",
  "golosinas",
  "gaseosas",
  "almacen",
  "vinoteca",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
export type CategoryLayout = "hero" | "packshot" | "list";

export interface CategoryDefinition {
  slug: CategorySlug;
  label: string;
  shortLabel: string;
  description: string;
  layout: CategoryLayout;
  accent: string;
  accentSoft: string;
  image?: string;
  /** Globo sobre el cartel. Sólo para lo que este kiosco tiene y otro no. */
  nota?: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryDefinition> = {
  tragos: {
    slug: "tragos",
    label: "Tragos",
    shortLabel: "Tragos",
    description: "Los que salen bien fríos y llegan listos para arrancar.",
    layout: "hero",
    accent: "#a970ff",
    accentSoft: "#2b1749",
    image: "/categorias/tragos.webp",
    nota: "Barra propia",
  },
  alfajores: {
    slug: "alfajores",
    label: "Alfajores",
    shortLabel: "Alfajores",
    description: "Clásicos, raros y de esos que no aparecen en cualquier kiosco.",
    layout: "hero",
    accent: "#ff7438",
    accentSoft: "#3d1c11",
    image: "/categorias/alfajores.webp",
  },
  cerveza: {
    slug: "cerveza",
    label: "Cerveza",
    shortLabel: "Cerveza",
    description: "Botellas y latas frías para resolver la noche.",
    layout: "packshot",
    accent: "#ffd447",
    accentSoft: "#3b3010",
    image: "/categorias/cerveza.webp",
  },
  fumar: {
    slug: "fumar",
    label: "Fumar",
    shortLabel: "Fumar",
    description: "Papelillos, filtros y lo que te acordaste cuando ya cerró todo.",
    layout: "list",
    accent: "#ef63b6",
    accentSoft: "#421631",
    image: "/categorias/fumar.webp",
  },
  sandwiches: {
    slug: "sandwiches",
    label: "Sándwiches",
    shortLabel: "Sándwiches",
    description: "Algo rico y directo para cortar el hambre.",
    layout: "hero",
    accent: "#ff7438",
    accentSoft: "#3d1c11",
    image: "/categorias/sandwiches.webp",
  },
  fiambres: {
    slug: "fiambres",
    label: "Fiambres",
    shortLabel: "Fiambres",
    // Se cortan por peso: la lista se lee como pizarra de mostrador, que es
    // como se pide en una fiambrería. La grilla de packshots no.
    description: "Se cortan al momento. Elegí cuántos gramos de cada uno.",
    layout: "list",
    accent: "#ef63b6",
    accentSoft: "#421631",
  },
  golosinas: {
    slug: "golosinas",
    label: "Golosinas",
    shortLabel: "Golosinas",
    description: "Dulce, ácido, chocolate: elegí tu antojo.",
    layout: "list",
    accent: "#a970ff",
    accentSoft: "#2b1749",
    image: "/categorias/golosinas.webp",
  },
  gaseosas: {
    slug: "gaseosas",
    label: "Gaseosas",
    shortLabel: "Gaseosas",
    description: "Frías, grandes y chicas.",
    layout: "packshot",
    accent: "#ffd447",
    accentSoft: "#3b3010",
  },
  almacen: {
    slug: "almacen",
    label: "Almacén",
    shortLabel: "Almacén",
    description: "Eso que faltó justo cuando te pusiste a cocinar.",
    layout: "list",
    accent: "#ff7438",
    accentSoft: "#3d1c11",
  },
  vinoteca: {
    slug: "vinoteca",
    label: "Vinoteca",
    shortLabel: "Vinoteca",
    // Es la categoría más larga del catálogo y son todas botellas: en grilla
    // con foto habría que scrollear cuarenta pantallas para encontrar un
    // fernet. Como lista se lee igual que la estantería.
    description: "Vinos, espumantes, aperitivos y destilados. La botella que falta.",
    layout: "list",
    accent: "#ffd447",
    accentSoft: "#3b3010",
  },
};

/** Los que se anuncian como cartel de neón arriba de todo. Sin foto: acá el
 *  nombre del rubro es el que tiene que gritar, no una imagen. */
export const PRIMARY_CATEGORIES = [
  "tragos",
  "alfajores",
  "cerveza",
  "fumar",
  "golosinas",
] as const;

/** El orden importa: los dos primeros van a ancho completo y con foto, los dos
 *  siguientes comparten línea, y el último cierra al lado de Lucas. */
export const SECONDARY_CATEGORIES = [
  "sandwiches",
  "gaseosas",
  "fiambres",
  "almacen",
  "vinoteca",
] as const;

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value as CategorySlug);
}
