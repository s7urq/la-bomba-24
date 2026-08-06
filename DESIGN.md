# Pasada de diseño — La Bomba 24

Documento de criterio para la pasada visual. El que implementa esto NO toca lógica:
ni rutas, ni el store, ni `src/lib/whatsapp.ts`, ni la estructura de datos, ni el
armado del mensaje. Solo `globals.css`, classNames, copy hardcodeado en JSX,
animaciones y micro-estados de UI puramente presentacionales.

**Contexto de uso:** cliente en el celu (diseñar a 380px), de madrugada, con una
mano, medio en pedo. Todo tiene que ser legible con brillo bajo, tocable con el
pulgar, y obvio sin leer dos veces.

**Anti-referencia:** PedidosYa / Rappi. Nada de cards blancas, sombras grises
suaves, azul corporativo, radius de 12px+. La estética es kiosco con onda:
cartel de neón sobre negro, barato-cool, contraste brutal.

---

## Reglas duras

1. **Permitido:** `globals.css`, atributos `className` y `style` presentacionales,
   strings de copy en JSX, keyframes, `key={...}` en spans para reiniciar
   animaciones, `useState`/`useEffect` locales SOLO para feedback visual
   (ej: detectar cambio de cantidad para animar). `navigator.vibrate(10)` en
   el add es opcional y aceptable.
2. **Prohibido:** tocar `src/store/cart-store.ts`, `src/lib/*` (whatsapp, catalog,
   csv, sheets, format), `src/config/categories.ts` (los accents quedan como
   están — ya son la paleta), rutas, providers, props entre componentes,
   condiciones de disabled/ready.
3. **Sin emojis como iconografía.** Lucide ya está, se sigue usando. Los botones
   dicen qué pasa ("Ver pedido", "Pedir por WhatsApp"), nunca solo un ícono.
4. **Sin webfonts nuevas.** El stack `"Arial Black", Impact, sans-serif` ES la
   estética barato-cool y pesa cero. No agregar next/font ni Google Fonts.
5. **El color señala, no decora.** El accent de categoría aparece en: borde de
   card disponible, botón de add, marker del item en el pedido, y el H1 de la
   categoría. En ningún otro lado. El amarillo (`--yellow`) es exclusivo de
   acciones de avance (dock, continuar). El verde es exclusivo de WhatsApp y
   del estado "abierto". No mezclar.
6. `prefers-reduced-motion` ya está manejado al final de `globals.css` — toda
   animación nueva queda cubierta por ese bloque, no hace falta nada extra.
7. AGENTS.md manda: antes de tocar cualquier `.tsx`, leer la doc de este Next
   en `node_modules/next/dist/docs/`. Para CSS puro no hace falta.

---

## Tokens (`:root` en globals.css)

Ajustes, no reemplazo:

```css
--background: #060606;      /* bajar un pelo, negro más real */
--radius: 3px;              /* nuevo token; unificar TODOS los border-radius de 4-5px a 3px. Los pills (badges, header-cart) quedan redondos. */
--green-whatsapp: #35d96b;  /* nuevo; el #73e59a actual es pastel-Rappi, matarlo */
```

Regla de radius: 3px para cards/botones/inputs, 999px para pills/badges. Nada
intermedio. El radius chico es lo que separa "kiosco" de "app de cadena".

Números: todo precio y contador usa `font-variant-numeric: tabular-nums` (ponerlo
en `body` directamente) para que los totales no bailen al animar.

---

## P1 — Cart dock (`cart-dock` en globals.css, `src/components/cart-dock.tsx`)

Es la prioridad #1 y hoy es lo más tímido de la app. Objetivo: imposible de
ignorar, total protagonista.

- **Borde superior:** reemplazar `border-top: 1px solid #393939` por
  `border-top: 2px solid var(--yellow)` + un glow contenido:
  `box-shadow: 0 -1px 18px rgba(255, 212, 71, 0.18), 0 -15px 40px rgba(0,0,0,0.6)`.
  Es el único glow amarillo de toda la app — por eso funciona.
- **El total:** `strong` pasa a Arial Black, `font-size: 1.55rem`,
  `letter-spacing: -0.04em`, `line-height: 1`. El label de arriba
  ("3 productos") queda como está: chiquito, muted, uppercase. El contraste
  entre los dos es el diseño.
- **El botón "Ver pedido":** `min-height: 52px`, `padding: 0 22px`,
  `font-size: 0.85rem`, texto en uppercase, radius 3px. Fondo amarillo pleno,
  texto casi negro (ya está así). En `:active`: `transform: scale(0.96)`.
- **Animación de entrada del total:** en el `.tsx`, envolver el monto con
  `<strong key={subtotal}>` y en CSS darle
  `animation: total-pop 260ms cubic-bezier(0.2, 1.4, 0.4, 1)`:
  keyframe de `scale(1.12)` → `scale(1)` con un flash breve de color
  `var(--yellow)` → `var(--text)`. Cada vez que el subtotal cambia, el número
  "late". Esto conecta con P2.
- **Padding inferior:** ya respeta `safe-area-inset-bottom`, no tocar esa parte.
- El dock convive con `category-page { padding-bottom: 128px }` — si el dock
  crece en altura, subir ese padding para que la última card no quede tapada.

## P2 — Feedback al agregar (product-card + dock)

Ya existe la mitad de la infraestructura: `justAdded` (prop), clase
`product-card--added`, badge `.product-count`, ícono Check. Falta que se sienta.

- **Flash de card:** `product-card--added` hoy solo pone `background: #222`.
  Cambiar a: fondo `var(--accent-soft)` de la categoría — como el accent llega
  por `style={{ borderColor }}` inline, la vía CSS-pura es definir en el
  componente `style={{ "--card-accent": category.accent, "--card-accent-soft": category.accentSoft }}`
  (presentacional, permitido) y usar esas vars en CSS. `--added` entonces:
  `background: var(--card-accent-soft)` + `border-color` ya está.
- **Badge en layout lista/búsqueda:** ahí el precio ocupa el centro de la fila,
  así que `.product-count--list` no puede ir flotando a la izquierda del botón
  (se monta encima del precio). Va apoyado sobre la esquina superior derecha del
  botón de sumar, 21px, igual que el badge del carrito en el header.
- **Pop del badge de cantidad:** `.product-count` recibe
  `<span key={quantity}>` en el `.tsx` y en CSS
  `animation: count-pop 220ms cubic-bezier(0.2, 1.6, 0.4, 1)` — keyframe
  `scale(0.6)` → `scale(1.25)` → `scale(1)`. El número que sube y salta ES el
  feedback principal.
- **El :active de la card** ya escala a 0.975 en 90ms — está bien, dejarlo.
- **Botón add (`.product-add`):** subirlo de 28px a **34px** (target táctil) y
  darle el mismo pop que el badge cuando `justAdded` (reusar keyframe).
- **Vibración (opcional):** `navigator.vibrate?.(10)` dentro del handler de add
  en el componente de pantalla que ya maneja `justAdded`. Una línea, sin estado.
- Con `key={subtotal}` en el dock (P1), agregar desde el catálogo produce:
  card flashea → badge salta → total del dock late. Tres señales, cero lógica.

## P3 — Densidad del catálogo (product-grid / product-card)

Objetivo: más productos por pantalla a 380px sin sensación de apretado. La
densidad sale de recortar aire interno, no de achicar tipografía de precio.

- `product-grid` gap: 8px → **6px** (mobile). El breakpoint 520px queda en 12px.
- **Cards hero:** `product-card--hero .product-card__visual` de `1/1.05` →
  `aspect-ratio: 1/0.8`. `product-card__body`: `min-height: 122px` → **quitar
  el min-height** y bajar padding a `10px`, gap interno 12px → 8px.
  La descripción (`__copy p`) en hero pasa a `-webkit-line-clamp: 1`.
- **Cards packshot:** margen del visual `12px 12px 0` → `8px 8px 0`;
  `__body` min-height 105px → sin min-height, padding 10px.
- **Cards list:** `min-height: 84px` → **72px**; padding vertical 13px → 10px.
- **Precio:** subirlo de `0.85rem` a `0.95rem`, weight 900 ya está. En una
  pasada de densidad, el precio es lo único que crece — es lo que el borracho
  necesita leer.
- **El aire grande no estaba en las cards sino en el encabezado de categoría:**
  `category-heading` con `padding: 36px 0 23px` y un H1 en `clamp(2.7rem, 14vw, …)`
  empujaba el primer producto a 338px del top. Bajado a `18px 0 14px` y
  `clamp(2.4rem, 12.5vw, 5rem)` — el cartel sigue gritando y se recuperan ~100px.
- Objetivo medible a 380×800: **4 cards hero completas** visibles (hoy entran
  ~2.5) y **7+ filas list**.
- No tocar tamaños de target táctil por densidad: el add queda en 34px (P2) y
  la card entera sigue siendo el botón.

## P4 — Botón "Pedir por WhatsApp" (`whatsapp-button`, checkout)

Final del embudo. Tiene que ser lo más grande y evidente de la pantalla.

- `min-height: 54px` → **68px**. `font-size: 0.82rem` → **1rem**, texto en
  **uppercase**, Arial Black, `letter-spacing: -0.02em`.
- Fondo: `#73e59a` → `var(--green-whatsapp)` (#35d96b), texto `#041008`.
- Glow: `box-shadow: 0 0 24px rgba(53, 217, 107, 0.35)`. Único glow verde de
  la app (el dot del delivery-strip ya tiene el suyo, conviven bien porque
  significan lo mismo: "está vivo, mandá").
- **Sticky:** hacerlo `position: sticky; bottom: calc(12px + env(safe-area-inset-bottom))`
  dentro del form, con `z-index` sobre el contenido. Mientras el usuario
  completa el form, el botón ya está ahí esperando. El `.whatsapp-help` queda
  debajo, no-sticky, está bien que se pierda.
- Disabled queda como está (gris #292929) pero agregar `filter: saturate(0)` —
  la diferencia prendido/apagado tiene que verse de lejos.
- `:active` cuando está enabled: `scale(0.97)`.
- El ExternalLink icon del final se queda: dice la verdad ("esto te saca de acá").

## P5 — Copy rioplatense (strings hardcodeados en JSX)

Cambiar SOLO los strings, no la estructura ni las condiciones. Los mensajes que
vienen del Sheet (`mensajeCerrado`, `horarioTexto`) no se tocan — solo los
titulares hardcodeados que los enmarcan.

| Dónde | Hoy | Propuesta |
|---|---|---|
| `order-screen.tsx` empty | "Tu carrito está vacío" | **"ACÁ NO HAY NADA"** |
| ídem, bajada | "Podés volver al catálogo o pedir algo que no figure abajo." | "Todavía no tiraste nada. Volvé al catálogo o escribí lo que quieras acá abajo." |
| `checkout-screen.tsx` closed-note | "El delivery no figura activo ahora." | **"AHORA ESTAMOS CERRADOS"** (+ el mensaje del Sheet abajo, como ya está). Si el Sheet no manda nada, el fallback visible es `horarioTexto` — no inventar horarios en el código. |
| `checkout-screen.tsx` form-blocker vacío | "Tu pedido quedó vacío. Volvé y agregá un producto o un pedido libre." | "Te quedaste sin nada en el pedido. Volvé para atrás y sumá algo." |
| `order-screen.tsx` botón disabled | "Agregá algo para continuar" | "Sumá algo primero" |
| `catalog-notice.tsx` cache | "Estás viendo la última lista guardada" | "Estás viendo la última lista que tenemos" |
| empty-catalog (en `category-screen.tsx`) | (verificar el string actual) | Titular en mayúsculas estilo "ACÁ NO APARECIÓ NADA", bajada que ofrezca el pedido libre. |

Criterio general del copy: titulares cortos, en mayúsculas, sin signos de
apertura en los gritos; bajadas en tono de mostrador ("volvé", "sumá", "tirá"),
nunca "¡Ups!" ni "Lo sentimos". Los titulares de estado vacío usan la misma
Arial Black gigante que los H1 — el estado vacío también es cartel.

Los estados vacíos (`empty-order`, `empty-catalog`) además: sacar el borde
dashed gris de `empty-order` y reemplazar por `border: 1px solid var(--line)`
con el titular en `font-size: 2rem` Arial Black. Que el vacío grite, no que
pida perdón.

---

## Detalles de segunda pasada (si sobra presupuesto)

- `header-cart` badge naranja: darle el mismo `count-pop` con `key={quantity}`.
- `.quantity-control` botones: altura 36px → 44px (target táctil de madrugada),
  y el número central en Arial Black 0.85rem.
- `.zone-detail`: los strong en `#e0caef` violeta lavado → subir contraste a
  `var(--text)` y dejar el violeta solo en el borde.
- Inputs del checkout: `height: 50px` → 54px, `font-size: 16px` mínimo en el
  input (evita el zoom automático de iOS al focusear).
- `catalog-search`: altura 48px está bien; el focus ya toma el accent de
  categoría, no tocar.

## QA / criterios de aceptación (a 380×800, DevTools)

1. Home, categoría, pedido y checkout: sin scroll horizontal, sin nada tapado
   por el dock.
2. Agregar un producto produce tres señales visibles: flash de card, pop de
   badge, latido del total en el dock.
3. En categoría hero entran ≥4 cards completas por pantalla.
4. En checkout, el botón de WhatsApp es visiblemente el elemento más grande y
   está a la vista aunque el form no esté completo (sticky).
5. `npm run build` pasa. Ningún test de `src/lib/*.test.ts` se toca ni se rompe
   (`whatsapp.test.ts` verde = no rompiste la regla #2).
6. Todo botón/target interactivo ≥ 44px en su lado menor, salvo el add de card
   (34px) que vive dentro de una card que es toda botón.
