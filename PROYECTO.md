# La Bomba 24 — web de pedidos

Kiosco y almacén de barrio en Quilmes. Abierto todo el día.
**De jueves a domingo, 20:00 a 03:00, prende el delivery con moto propia.**

La web es un catálogo con carrito que termina en un mensaje de WhatsApp al local.
No procesa pagos. No tiene usuarios. No tiene backend.

La frase que define el negocio: **"te llevamos cualquier cosa"**. Si no está en la
lista, se pide igual.

---

## Decisiones cerradas — no re-discutir

**Stack:** Next.js (App Router) + TypeScript + Tailwind. Carrito en `localStorage`.
Sin librería de componentes.

**Base de datos: no hay.** El catálogo vive en un Google Sheet publicado como CSV.
La web lo baja en el cliente al cargar y lo cachea. El dueño edita la planilla y en
el próximo refresh los precios ya están actualizados. Cero deploys para cambiar un
precio.

**Sin login, sin panel de admin, sin RLS, sin auth.** El panel es el Sheet.

**Deploy:** Cloudflare Pages. (Vercel Hobby prohíbe uso comercial y baja cuentas;
si se usa Vercel, tiene que ser plan pago cuando salga a producción.)

**Sin lógica de horarios calculada.** Hay una celda en el Sheet que dice si el
delivery está prendido o no. Punto.

---

## Los datos: el Sheet

Tres pestañas, publicadas como CSV (`Archivo → Compartir → Publicar en la web`).
Las URLs van en `.env` como `NEXT_PUBLIC_SHEET_PRODUCTOS`, `_ZONAS`, `_CONFIG`.

### Pestaña `productos`
```
categoria | marca | nombre | descripcion | precio | destacado | disponible | imagen
```
- `categoria`: slug en minúscula sin acentos (`tragos`, `alfajores`, `cerveza`, `fumar`,
  `sandwiches`, `fiambres`, `golosinas`, `gaseosas`, `almacen`, `bazar`)
- `precio`: número entero, sin símbolo, sin separador de miles
- `destacado`: `si` / vacío → sube al principio de su categoría
- `disponible`: `no` → se muestra en gris y no se puede agregar
- `imagen`: URL o vacío

**Si `precio` está vacío, el producto no se renderiza.** Nunca inventar un precio ni
mostrar "consultar".

### Pestaña `zonas`
```
nombre | costo | pedido_minimo | minutos
```

### Pestaña `config`
```
clave | valor
```
Claves: `delivery_activo` (`si`/`no`), `mensaje_cerrado`, `whatsapp`, `horario_texto`.

---

## La home

**Header:** estado del delivery. Verde y "Repartiendo ahora" si `delivery_activo=si`.
Si no: cartel con `horario_texto` — **pero el catálogo se ve igual**. La web nunca se
apaga; la gente manda el link a cualquier hora.

**Cuatro bloques grandes, con foto:**

> **TRAGOS · ALFAJORES · CERVEZA · FUMAR**

Tragos y alfajores porque es lo que el local trabaja con onda y no se consigue en otro
lado a esa hora. Fumar porque a las 2 AM no hay dónde comprar papelillos y el que
busca ya sabe qué quiere.

**Franja ancha, clickeable:** *"Te llevamos cualquier cosa. Escribinos lo que
necesitás."* → abre el campo de pedido libre.

**Abajo, fila compacta:** sándwiches · fiambres · golosinas · gaseosas · almacén · bazar

---

## Las pantallas

**Categoría.** Grilla de 2 columnas en mobile. Buscador sticky arriba con debounce,
que busca en todo el catálogo, no solo en la categoría. Tap en la card agrega al
carrito sin abrir modal, con feedback visual. Barra fija abajo con total y "Ver pedido".

Tres layouts según la categoría:
- **Hero** (foto grande): tragos, alfajores, sándwiches
- **Packshot** (foto chica cuadrada): cerveza, gaseosas, fiambres
- **Lista** (filas, sin foto): golosinas, almacén, bazar, fumar

Meter fotos grandes en una categoría lista la empeora: hace scrollear más para
encontrar lo mismo.

**Carrito.** Cantidades editables. Campo libre grande: *"¿Falta algo? Escribilo acá"*.

**Checkout.** Nombre, dirección, select de zona (muestra costo y pedido mínimo al
elegir), notas. Un botón: **"Pedir por WhatsApp"**.

---

## El mensaje de WhatsApp

Se arma con `encodeURIComponent` y se abre `wa.me/{whatsapp del config}?text=`.

```
*PEDIDO WEB*

• 2x Heineken 970ml — $15.400
• 1x Caipi Maracuyá — $9.000
• 3x Alfajor Jorgito — $2.400

Subtotal: $26.800
Envío (Zona 2): $1.500
*Total: $28.300*

Nombre: Santi
Dirección: Mitre 1234, Quilmes
Nota: tocar timbre 2B
Además: un paquete de Marlboro box
```

Si supera 1800 caracteres, truncar los ítems y agregar "(seguí en el chat)".

---

## Estética

Dark. Fondo casi negro. Acentos violeta / naranja / amarillo, un color por categoría.
Tipografía grotesca pesada, títulos en mayúscula donde el color parte la frase en dos.
Cards con borde de 1px del color de su categoría. **Mobile-first, diseñado a 380px** —
el 95% de los pedidos entran de un celular a la madrugada.

Copy en rioplatense con voseo. Los botones dicen qué pasa: "Pedir por WhatsApp", no
"Enviar". Sin emojis como iconografía.

---

## Fuera de alcance (V1)

Mapa de zonas · panel de admin · login · pagos · cuentas de usuario · historial de
pedidos · notificaciones · precio por peso con fórmula de cuarto · estados de pedido.

Si algo de esto aparece en el camino, va a `PENDIENTES.md` y se sigue.

---

## Orden de ataque

1. **Sheet armado y publicado** con 10 productos de prueba y las 3 pestañas. 20 min.
2. **Repo + deploy en blanco online.** Antes de escribir una línea de app.
3. **Agente builder:** "Leé PROYECTO.md y construí la app completa." Una sola corrida.
4. **En paralelo, sesión aparte de catálogo:** cargar productos y precios reales al
   Sheet desde los PDFs y las fotos de góndola. Esto no depende del código.
5. Ajustes de UI sobre lo que ya existe.

---

## Lo que falta y solo lo tiene el dueño

- **Zonas de reparto, costo de envío y pedido mínimo.** Bloquea el checkout.
- **Precios de alfajores.** Es la sección estrella y no hay ni un dato.
- **Número de WhatsApp del local confirmado.**
- Horario exacto y qué días efectivamente sale la moto.
