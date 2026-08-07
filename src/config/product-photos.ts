/**
 * Fotos de producto que viven en el repo.
 *
 * La planilla manda: si una fila tiene algo en la columna `imagen`, gana esa.
 * Este mapa es el respaldo para las fotos que ya están commiteadas en
 * `public/productos/`, así no hay que cargar rutas a mano en el Sheet.
 *
 * No contradice la regla de "el panel es la planilla": el archivo de la foto
 * ya vive en el repo y publicarlo requiere un deploy igual, así que la ruta
 * bien puede vivir al lado del archivo.
 *
 * La clave es el id que arma `parseProductsCsv`: categoría, marca y nombre
 * normalizados (sin acentos, en minúscula) y unidos con dos puntos. Si en la
 * planilla cambia el nombre o la marca de un producto, cambia el id y la foto
 * deja de aparecer — no se rompe nada, simplemente vuelve al placeholder.
 */
export const FOTOS_DE_PRODUCTO: Record<string, string> = {
  "alfajores:capitan-del-espacio:alfajor-blanco":
    "/productos/alfajores/capitan-del-espacio-blanco.webp",
  "alfajores:felices-las-vacas:mani": "/productos/alfajores/felices-las-vacas-mani.webp",
  "alfajores:pescado-raul:simple-negro": "/productos/alfajores/pescado-raul-simple-negro.webp",
  // La planilla separó "Caipi Frutos Rojos" y "Caipi Frutilla" en dos
  // productos: la foto es la de frutilla y va sólo a ése.
  "tragos:la-bomba-24:caipi-frutilla": "/productos/tragos/caipi-frutilla.webp",
  "tragos:la-bomba-24:caipi-jagger": "/productos/tragos/caipi-jagger.webp",
  "tragos:la-bomba-24:caipiroska": "/productos/tragos/caipiroska.webp",
};
