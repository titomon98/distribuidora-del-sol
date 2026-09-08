# AGENTS.md — Distribuidora del Sol

Guía para cualquier agente de IA (Claude Code u otros) que trabaje en este repositorio.
El detalle completo del proyecto está en [`CLAUDE.md`](./CLAUDE.md); este archivo resume las
reglas operativas.

## Proyecto

Aplicación **web** para administrar la miscelánea *Distribuidora del Sol*. Coordina un **punto de
cobro** y un **punto de despacho** ubicados en lugares físicos distintos del negocio, con
comunicación **en tiempo real** entre ellos. Recibos internos (sin facturación fiscal).

## Stack

- **Frontend:** React 18 (SPA, react-scripts), basada en la plantilla *Fooddesk* (DexignLab) en
  `frontend/`. React Router 6, Redux + redux-thunk, React-Bootstrap 5, SCSS (node-sass), axios,
  ApexCharts/Chart.js/Recharts. Dev: `npm start`; estilos: `npm run sass`.
- **Backend:** NestJS (Node + TypeScript), modular.
- **ORM:** **TypeORM** sobre PostgreSQL (entidades + migraciones).
- **Tiempo real:** WebSockets (Gateway de NestJS) para cobro ↔ despacho.
- **Base de datos:** PostgreSQL.

## Estructura

- `backend/` — API NestJS + TypeORM + PostgreSQL. Esqueleto listo: `migrations/` (001..018),
  `src/entities/` (15 tablas), `src/common/` (base entity, idempotencia, auditoría). WebSockets
  pendiente. Ver `backend/README.md`. **Aún NO migrar a PostgreSQL ni unir con el frontend.**
- `frontend/` — SPA React (Fooddesk). Código en `src/jsx` (UI), `src/store` (Redux), `src/services`
  (axios/auth — reemplazar por la API NestJS), estilos en `src/scss`. Trae contenido demo del
  template: conservar solo lo del alcance e ir podando el resto.

## Reglas para agentes

1. **Alcance cerrado.** Construir solo lo listado en la sección 2 de `CLAUDE.md`: inventario
   (con alertas e historial), cobro↔despacho en tiempo real, catálogo, cierre de caja diario,
   ventas y recibos internos, y base multi-sucursal. Todo lo demás se cotiza aparte —
   **pregunta antes de implementarlo**.
2. **Fuera de alcance (no hacer sin autorización):** facturación fiscal FEL/SAT y app móvil
   nativa.
3. **Multi-sucursal desde el día 1:** cada tabla de dominio lleva `branch_id`.
4. **Dinero e inventario son contables:** montos en GTQ (`Q`) sin `float`; movimientos de
   inventario y ventas dentro de transacciones, con historial, nunca sobrescribiendo contadores.
   **Toda operación de escritura debe ser idempotente** (varios clicks al mismo botón):
   `Idempotency-Key` + índices únicos. Cada tabla lleva `estado`, timestamps, `created_by/updated_by`
   y se audita en `auditoria`.
5. **Idioma:** UI y datos de dominio en español; código (identificadores, tablas) en inglés.
6. **No cambies el stack ni agregues dependencias pesadas** sin confirmarlo con el usuario.
7. **Git:** el repo aún no está inicializado; no crees commits salvo que el usuario lo pida.
8. **Comandos:** frontend con `npm install` / `npm start` / `npm run build` / `npm run sass`.
   Backend por iniciar; documenta sus comandos en `CLAUDE.md` cuando existan.

## Contacto

Ing. Arturo Monterroso · arturomonterroso3@gmail.com · +(502) 3513-0842
