# Distribuidora del Sol — Sistema de administración para miscelánea

Guía para agentes que trabajan en este repositorio. Léela antes de generar o modificar código.

## 1. Qué es este proyecto

Aplicación **web** (accesible desde cualquier navegador, **no** app nativa) para administrar una
miscelánea. Basado en la propuesta técnica y económica entregada al cliente. El sistema coordina
un **punto de cobro** y un **punto de despacho** que están en **ubicaciones físicas distintas**
dentro del negocio, por lo que la comunicación entre estaciones debe ser **en tiempo real**.

Cliente: Distribuidora del Sol · Desarrollo: Ing. Arturo Monterroso · Plazo: 2 semanas desde la
confirmación.

## 2. Alcance funcional (lo que SÍ construimos)

1. **Control de inventario**
   - Registro de existencias por producto.
   - Alertas de existencia baja o agotada.
   - Historial de entradas y salidas de inventario.
2. **Punto de cobro y punto de despacho (tiempo real)**
   - Registro del pedido y cobro desde la estación de caja.
   - Envío inmediato del pedido a la estación de despacho (están en lugares distintos).
   - Marcado de pedidos como *despachados* o *pendientes*, visible desde ambas estaciones.
3. **Administración del catálogo**
   - Catálogo de productos para la venta.
   - Edición de precios, disponibilidad y categorías.
4. **Cierre de caja diario**
   - Reporte de ventas totales del día.
   - Desglose por método de pago.
5. **Ventas y recibos**
   - Registro de cada venta y generación de un recibo/ticket **interno** (no fiscal).
6. **Base para futuras sucursales**
   - Arquitectura multi-sucursal desde el diseño de datos, aunque solo opere una sucursal ahora.
   - La activación de una segunda sucursal la hace el administrador, sin cobro adicional.

## 3. Fuera de alcance (NO construir sin autorización explícita)

- **Facturación fiscal electrónica (FEL) ante la SAT.** Los recibos son internos.
- **App móvil nativa (iOS/Android).** Es una web responsive.
- Cualquier módulo o funcionalidad no listada en la sección 2. Si surge la necesidad, **pregúntale
  al usuario antes de implementarla**: es una ampliación que se cotiza aparte.

## 4. Stack técnico

- **Frontend:** React 18 (SPA, Create React App / react-scripts). Basado en la plantilla
  *Fooddesk* (DexignLab), un admin de restaurante/food-delivery ubicado en `frontend/`. Reutilizar
  sus componentes y estilos; adaptarlos al dominio de miscelánea.
  - **Ruteo:** React Router 6 (`react-router-dom`).
  - **Estado:** Redux + `redux-thunk` (`src/store/`, con `actions/`, `reducers/`, `selectors/`).
  - **UI:** React-Bootstrap (Bootstrap 5) + SCSS. Los estilos se compilan con
    `npm run sass` (node-sass observa `src/scss/main.scss` → `src/css/style.css`).
  - **HTTP:** `axios` a través de `src/services/AxiosInstance.js`. La capa de auth de ejemplo
    (`src/services/AuthService.js`) es del template y **debe reemplazarse** para apuntar al backend
    NestJS.
  - **Gráficas:** ApexCharts / Chart.js / Recharts (usar para reportes y cierre de caja).
- **Backend:** NestJS (Node + TypeScript), arquitectura modular.
- **ORM:** **TypeORM** sobre PostgreSQL (entidades + migraciones).
- **Tiempo real:** WebSockets (Gateway de NestJS, `@nestjs/websockets`) para el canal
  cobro ↔ despacho. En el frontend, consumir con un cliente WebSocket/Socket.IO.
- **Base de datos:** PostgreSQL.
- **Despliegue:** nube (el primer mes de hosting va incluido en la propuesta).

## 5. Estructura del repositorio

```
distribuidora-del-sol/
├── backend/      # API NestJS + WebSocket Gateway + TypeORM + PostgreSQL (por construir)
├── frontend/     # SPA React (plantilla Fooddesk)
│   ├── public/
│   ├── src/
│   │   ├── jsx/         # components/, layouts/, pages/  (UI del template)
│   │   ├── store/       # Redux: actions/, reducers/, selectors/
│   │   ├── services/    # AxiosInstance, AuthService (reemplazar por API NestJS)
│   │   ├── scss/ · css/ # estilos (compilar con npm run sass)
│   │   ├── icons/ · images/ · vendor/
│   │   └── App.js · index.js
│   ├── package.json
│   └── package-lock.json
├── CLAUDE.md
└── AGENTS.md
```

- El frontend trae mucho contenido demo del template (páginas de restaurante, chat, calendario,
  widgets). Conservar solo lo que sirva al alcance de la sección 2 e ir podando el resto.

## 6. Convenciones y decisiones de diseño

- **Idioma:** UI, mensajes al usuario y datos de dominio en **español**. Nombres de código
  (variables, funciones, tablas) en inglés.
- **Moneda:** Quetzal guatemalteco (GTQ, `Q`). Guardar montos en enteros (centavos) o `numeric`,
  nunca en `float`.
- **Multi-sucursal:** toda tabla de dominio (productos, existencias, ventas, pedidos, cajas) lleva
  `branch_id` desde el inicio, aunque solo exista una sucursal.
- **Cierre de caja e inventario son contables:** usar transacciones de base de datos; nunca
  perder ni duplicar movimientos. Las existencias se ajustan como movimientos con historial, no
  sobrescribiendo un contador.
- **Roles:** al menos administrador, cajero (cobro) y despachador. La activación de sucursales es
  exclusiva del administrador.

## 7. Cómo trabajar en este repo

- **Frontend** (`frontend/`): `npm install`, luego `npm start` (dev en :3000), `npm run build`
  (producción), `npm test`, y `npm run sass` para recompilar estilos SCSS mientras se desarrolla.
- **Backend** (`backend/`): por iniciar. Cuando se establezca NestJS, documenta aquí los comandos
  (instalar, `start:dev`, migraciones de TypeORM, tests) y mantenlos actualizados.
- El repo **todavía no está bajo git.** No inicialices git ni hagas commits salvo que el usuario
  lo pida.
- Antes de agregar dependencias pesadas o cambiar el stack de la sección 4, **confírmalo con el
  usuario**.
- Prioriza que el sistema completo (inventario, cobro↔despacho en tiempo real, catálogo, cierre de
  caja, recibos) funcione dentro del plazo de 2 semanas; evita sobre-ingeniería fuera del alcance.

## 8. Contacto

Ing. Arturo Monterroso · arturomonterroso3@gmail.com · +(502) 3513-0842
