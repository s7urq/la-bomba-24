# La Bomba 24

Webapp de pedidos para La Bomba 24, construida con Next.js, TypeScript, Tailwind y Supabase.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm test`: tests unitarios.
- `npm run typecheck`: chequeo de TypeScript.
- `npm run lint`: chequeo de ESLint.
- `npm run build`: build de producción.
- `npm run import:csv -- ruta/al/archivo.csv`: importa productos usando `.env.local`.

## Variables de entorno

Copiar las claves documentadas en `.env.example` a `.env.local`. La service role y el PIN son secretos de servidor y nunca deben exponerse al cliente.

## Base de datos

Las migraciones están en `supabase/migrations` y los datos de prueba deliberadamente falsos en `supabase/seed.sql`.

## Estado de implementación

En esta etapa están preparados el scaffolding, el esquema de datos, el seed, el importador CSV y la lógica de dominio con tests. Las pantallas y Route Handlers se implementan en la etapa siguiente.
