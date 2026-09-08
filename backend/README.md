# Backend — Distribuidora del Sol

API de administración de la miscelánea. **NestJS + TypeORM + PostgreSQL.**

> Estado actual: esqueleto inicial. Están el esquema completo (entidades +
> migraciones), la infraestructura de idempotencia y de auditoría, y la
> configuración de conexión. **Todavía NO se migra nada a PostgreSQL** y el
> backend aún **no se conecta con el frontend**.

## Requisitos

- Node.js 18+
- PostgreSQL 13+ (por `gen_random_uuid()`), cuando se autorice migrar.

## Puesta en marcha (cuando se autorice)

```bash
cd backend
npm install
cp .env.example .env   # completar credenciales de PostgreSQL
```

Aún no ejecutar migraciones. Cuando se decida crear la base:

```bash
npm run migration:run      # aplica migrations/*.ts en orden
npm run migration:show     # lista estado de migraciones
npm run migration:revert   # revierte la última
npm run start:dev          # levanta la API en http://localhost:3001/api
```

## Estructura

```
backend/
├── migrations/                 # UNA migración por paso, en orden (001..018)
├── src/
│   ├── main.ts                 # bootstrap NestJS
│   ├── app.module.ts           # módulo raíz (registra TypeORM)
│   ├── config/data-source.ts   # DataSource central (app + CLI de migraciones)
│   ├── common/
│   │   ├── entities/           # BaseEntity y BaseTiendaEntity
│   │   ├── idempotency/        # IdempotencyKey + interceptor
│   │   └── audit/              # Auditoria + subscriber
│   └── entities/               # 15 entidades de dominio del esquema
└── .env.example
```

## Migraciones

Se versionan en `/migrations`, una por paso, con el formato
`NNN-migracion-N-titulo`. El orden respeta las llaves foráneas:

| #  | Migración                | Contenido |
|----|--------------------------|-----------|
| 01 | extension-y-tienda       | `pgcrypto` + `tienda` |
| 02 | rol                      | `rol` |
| 03 | usuario                  | `usuario` (FK tienda, rol) |
| 04 | auditoria                | bitácora de auditoría |
| 05 | idempotency-key          | claves de idempotencia |
| 06 | marca                    | `marca` |
| 07 | tipo-producto            | `tipo_producto` |
| 08 | proveedor                | `proveedor` |
| 09 | cliente                  | `cliente` (+ CF único por tienda) |
| 10 | producto                 | `producto` (precios, código de barras, stock mínimo) |
| 11 | lote                     | `lote` (existencias) |
| 12 | compra                   | `compra` (idempotency_key único) |
| 13 | detalle-compra           | `detalle_compra` |
| 14 | credito-proveedor        | `credito_proveedor` |
| 15 | venta                    | `venta` (estado_despacho, idempotency_key único) |
| 16 | detalle-venta            | `detalle_venta` |
| 17 | credito-cliente          | `credito_cliente` |
| 18 | datos-iniciales          | seed: tienda, roles, cliente CF |

Cada migración usa SQL idempotente (`CREATE TABLE IF NOT EXISTS`, índices
`IF NOT EXISTS`, seeds con `ON CONFLICT` / `NOT EXISTS`), de modo que
reejecutarla no rompe ni duplica.

## Convenciones del esquema

- **Claves**: UUID (`gen_random_uuid()`), útil para idempotencia y para migrar
  registros entre tiendas.
- **Multi-tienda**: toda tabla de dominio lleva `tienda_id`.
- **Columnas comunes** en cada tabla: `estado` (varchar; a futuro >2 estados por
  tipo de registro), `created_at`, `updated_at`, `created_by`, `updated_by`.
- **Dinero**: `numeric(12,2)` en GTQ (nunca `float`).

## Idempotencia (desde el diseño)

La app puede recibir varios clicks al mismo botón. Dos capas de defensa:

1. **A nivel de datos**: índices ÚNICOS parciales `idempotency_key` en `venta` y
   `compra`, y tabla `idempotency_key`. Dos requests concurrentes con la misma
   clave no pueden crear dos filas.
2. **A nivel de API**: `IdempotencyInterceptor` (`common/idempotency`). El
   cliente envía la cabecera `Idempotency-Key`; la primera petición ejecuta la
   operación y guarda su respuesta, las repeticiones devuelven esa respuesta o
   responden `409` si la original sigue en proceso.

Toda operación de negocio (crear venta, registrar compra, ingresar lote, marcar
despacho) debe ejecutarse dentro de **una transacción** y apoyarse en estas
garantías.

## Auditoría

`AuditSubscriber` (`common/audit`) escribe en la tabla `auditoria` cada
INSERT/UPDATE/DELETE (ignorando `auditoria`, `idempotency_key` y la tabla de
migraciones). El actor (`usuario_id`) e `ip` se completarán vía contexto de
request al implementar la autenticación.
