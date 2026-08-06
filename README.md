# La Bomba 24

Catálogo mobile-first para el kiosco La Bomba 24 de Quilmes. Carga productos, zonas y
estado del delivery desde tres pestañas de Google Sheets publicadas como CSV. El carrito
vive en `localStorage` y el checkout termina en un mensaje prearmado de WhatsApp.

No hay backend, usuarios, pagos ni panel: el Sheet es el panel.

## Desarrollo

1. Copiá `.env.example` a `.env.local`.
2. Publicá las pestañas `productos`, `zonas` y `config` como CSV y pegá sus URLs.
3. Ejecutá `npm run dev`.

Comandos de control:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

`npm run build` genera un export estático en `out/`, listo para publicar en Cloudflare
Pages. El comando de build es `npm run build` y el directorio de salida es `out`.

## Datos requeridos

La estructura exacta de columnas está documentada en [PROYECTO.md](./PROYECTO.md). Un
producto sin precio no se muestra. Si el Sheet falla, el navegador intenta usar la última
copia válida que haya guardado; nunca se reemplaza un precio faltante por uno inventado.

Antes de producción hay que completar en el Sheet las zonas y sus mínimos, los precios de
alfajores, el WhatsApp confirmado y el texto/estado real del delivery.
