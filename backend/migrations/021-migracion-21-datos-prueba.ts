import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 21: datos de prueba (≥50 por tabla de negocio).
 *
 * Puebla catálogo y movimientos para poder probar la app. Respeta FKs y el
 * modelo multi-sucursal (todo cuelga de la tienda por defecto). Es idempotente:
 * si ya existe 'Marca 0001' no vuelve a insertar.
 *
 * Exclusiones a propósito (el dominio no justifica 50): `tienda` (1 sucursal),
 * `rol` (3 roles base), `idempotency_key` (control interno). `auditoria` sí se
 * siembra (marcada con ip='SEED') porque el módulo de Reportes la usa para el
 * "quién hizo qué".
 *
 * Nota: los montos son datos de prueba; no cuadran detalle vs. cabecera al
 * centavo. Suficiente para desarrollo, no para conciliación contable.
 */
export class Migracion21DatosPrueba1700000000021 implements MigrationInterface {
  name = 'Migracion21DatosPrueba1700000000021';

  private readonly T = '00000000-0000-0000-0000-000000000001'; // tienda
  private readonly ADMIN = '00000000-0000-0000-0000-000000000031';
  private readonly ROL_CAJERO = '00000000-0000-0000-0000-000000000012';
  private readonly ROL_DESPACHADOR = '00000000-0000-0000-0000-000000000013';
  private readonly HASH =
    '$2b$10$B62f0a8dStIeKcJH/eB5hOaL8kmCTm3h25FFCOdreYsnxhNYGbxLa'; // 'admin123'

  public async up(q: QueryRunner): Promise<void> {
    const T = this.T;
    const ADMIN = this.ADMIN;

    const yaSembrado = await q.query(
      `SELECT 1 FROM marca WHERE tienda_id = $1 AND nombre = 'Marca 0001' LIMIT 1;`,
      [T],
    );
    if (yaSembrado.length > 0) return;

    // Marcas
    await q.query(
      `INSERT INTO marca (tienda_id, nombre, descripcion, created_by)
       SELECT $1, 'Marca ' || lpad(g::text,4,'0'), 'Marca de prueba ' || g, $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN],
    );

    // Tipos de producto (categorías)
    await q.query(
      `INSERT INTO tipo_producto (tienda_id, nombre, descripcion, created_by)
       SELECT $1, 'Categoría ' || lpad(g::text,4,'0'), 'Categoría de prueba ' || g, $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN],
    );

    // Proveedores
    await q.query(
      `INSERT INTO proveedor (tienda_id, nombre, nit, telefono, email, direccion, created_by)
       SELECT $1, 'Proveedor ' || lpad(g::text,4,'0'),
              (1000000 + g)::text, '5' || lpad((3000000+g)::text,7,'0'),
              'proveedor' || lpad(g::text,4,'0') || '@correo.com',
              'Zona ' || (1 + g % 25) || ', Ciudad', $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN],
    );

    // Clientes
    await q.query(
      `INSERT INTO cliente (tienda_id, nombre, nit, telefono, email, es_cf, created_by)
       SELECT $1, 'Cliente ' || lpad(g::text,4,'0'),
              (2000000 + g)::text, '4' || lpad((2000000+g)::text,7,'0'),
              'cliente' || lpad(g::text,4,'0') || '@correo.com', false, $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN],
    );

    // Usuarios (cajeros y despachadores)
    await q.query(
      `INSERT INTO usuario (tienda_id, rol_id, nombre, username, email, password_hash, created_by)
       SELECT $1,
              CASE WHEN g % 2 = 0 THEN $3::uuid ELSE $4::uuid END,
              'Usuario ' || lpad(g::text,4,'0'),
              'user' || lpad(g::text,4,'0'),
              'user' || lpad(g::text,4,'0') || '@distribuidora.local',
              $5, $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN, this.ROL_CAJERO, this.ROL_DESPACHADOR, this.HASH],
    );

    // Productos (marca y categoría aleatorias de las sembradas)
    await q.query(
      `INSERT INTO producto (tienda_id, marca_id, tipo_producto_id, nombre, codigo_barras,
                             precio_compra, precio_mayorista, precio_venta, stock_minimo, created_by)
       SELECT $1,
              (SELECT id FROM marca WHERE tienda_id=$1 AND nombre LIKE 'Marca %' ORDER BY md5(id::text || g::text) LIMIT 1),
              (SELECT id FROM tipo_producto WHERE tienda_id=$1 AND nombre LIKE 'Categoría %' ORDER BY md5(id::text || g::text || 't') LIMIT 1),
              'Producto ' || lpad(g::text,4,'0'),
              '9' || lpad(g::text,12,'0'),
              round((5 + random()*20)::numeric, 2),
              round((6 + random()*22)::numeric, 2),
              round((8 + random()*30)::numeric, 2),
              (5 + g % 10), $2
       FROM generate_series(1,50) g;`,
      [T, ADMIN],
    );

    // Lotes (uno por producto sembrado)
    await q.query(
      `INSERT INTO lote (tienda_id, producto_id, codigo_lote, cantidad_inicial,
                         cantidad_disponible, costo_unitario, fecha_ingreso, fecha_vencimiento, created_by)
       SELECT $1, p.id,
              'LOTE-' || lpad((row_number() OVER (ORDER BY p.nombre))::text,4,'0'),
              100, (40 + floor(random()*60))::int,
              round((3 + random()*15)::numeric,2),
              CURRENT_DATE - (row_number() OVER (ORDER BY p.nombre))::int,
              CURRENT_DATE + 180, $2
       FROM producto p WHERE p.tienda_id=$1 AND p.nombre LIKE 'Producto %';`,
      [T, ADMIN],
    );

    // Compras (proveedor + usuario admin)
    await q.query(
      `INSERT INTO compra (tienda_id, proveedor_id, usuario_id, numero_compra, fecha,
                           subtotal, impuesto, total, tipo_pago, created_by)
       SELECT $1,
              (SELECT id FROM proveedor WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              $2, 'C-' || lpad(g::text,5,'0'),
              now() - (g || ' days')::interval,
              s.subtotal, 0, s.subtotal,
              CASE WHEN g % 3 = 0 THEN 'CREDITO' ELSE 'CONTADO' END, $2
       FROM generate_series(1,50) g,
            LATERAL (SELECT round((100 + random()*900)::numeric,2) AS subtotal) s;`,
      [T, ADMIN],
    );

    // Detalle de compra (uno por compra)
    await q.query(
      `INSERT INTO detalle_compra (tienda_id, compra_id, producto_id, cantidad, precio_unitario, subtotal, created_by)
       SELECT $1, c.id,
              (SELECT id FROM producto WHERE tienda_id=$1 AND nombre LIKE 'Producto %' ORDER BY md5(id::text || c.id::text) LIMIT 1),
              d.cant, d.precio, round((d.cant * d.precio)::numeric,2), $2
       FROM compra c,
            LATERAL (SELECT (5 + floor(random()*20))::int AS cant, round((4 + random()*12)::numeric,2) AS precio) d
       WHERE c.tienda_id=$1 AND c.numero_compra LIKE 'C-%';`,
      [T, ADMIN],
    );

    // Créditos a proveedor
    await q.query(
      `INSERT INTO credito_proveedor (tienda_id, proveedor_id, compra_id, monto_total, saldo, fecha_vencimiento, created_by)
       SELECT $1,
              (SELECT id FROM proveedor WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              (SELECT id FROM compra WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              m.monto, round((m.monto * random())::numeric,2), CURRENT_DATE + (15 + g)::int, $2
       FROM generate_series(1,50) g,
            LATERAL (SELECT round((200 + random()*800)::numeric,2) AS monto) m;`,
      [T, ADMIN],
    );

    // Ventas (cliente + usuario; repartidas en la última semana, con hoy incluido)
    await q.query(
      `INSERT INTO venta (tienda_id, cliente_id, usuario_id, numero_venta, fecha,
                          subtotal, descuento, total, metodo_pago, tipo, estado_despacho, created_by)
       SELECT $1,
              (SELECT id FROM cliente WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              $2, 'V-' || lpad(g::text,5,'0'),
              now() - ((g % 7) || ' days')::interval,
              s.subtotal, 0, s.subtotal,
              CASE g % 3 WHEN 0 THEN 'EFECTIVO' WHEN 1 THEN 'TARJETA' ELSE 'TRANSFERENCIA' END,
              'CONTADO',
              CASE WHEN g % 2 = 0 THEN 'DESPACHADO' ELSE 'PENDIENTE' END, $2
       FROM generate_series(1,50) g,
            LATERAL (SELECT round((25 + random()*300)::numeric,2) AS subtotal) s;`,
      [T, ADMIN],
    );

    // Detalle de venta (dos por venta → ~100 filas; alimenta "productos más vendidos")
    await q.query(
      `INSERT INTO detalle_venta (tienda_id, venta_id, producto_id, cantidad, precio_unitario, subtotal, created_by)
       SELECT $1, v.id,
              (SELECT id FROM producto WHERE tienda_id=$1 AND nombre LIKE 'Producto %' ORDER BY md5(id::text || v.id::text || n::text) LIMIT 1),
              d.cant, d.precio, round((d.cant * d.precio)::numeric,2), $2
       FROM venta v, generate_series(1,2) n,
            LATERAL (SELECT (1 + floor(random()*8))::int AS cant, round((8 + random()*25)::numeric,2) AS precio) d
       WHERE v.tienda_id=$1 AND v.numero_venta LIKE 'V-%';`,
      [T, ADMIN],
    );

    // Créditos a cliente
    await q.query(
      `INSERT INTO credito_cliente (tienda_id, cliente_id, venta_id, monto_total, saldo, fecha_vencimiento, created_by)
       SELECT $1,
              (SELECT id FROM cliente WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              (SELECT id FROM venta WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
              m.monto, round((m.monto * random())::numeric,2), CURRENT_DATE + (10 + g)::int, $2
       FROM generate_series(1,50) g,
            LATERAL (SELECT round((50 + random()*400)::numeric,2) AS monto) m;`,
      [T, ADMIN],
    );

    // Auditoría (para Reportes: quién hizo qué). Marcada con ip='SEED'.
    await q.query(
      `INSERT INTO auditoria (usuario_id, tienda_id, accion, tabla, registro_id, datos_nuevos, ip, created_at)
       SELECT
         (SELECT id FROM usuario WHERE tienda_id=$1 ORDER BY md5(id::text || g::text) LIMIT 1),
         $1,
         CASE g % 3 WHEN 0 THEN 'INSERT' WHEN 1 THEN 'UPDATE' ELSE 'DELETE' END,
         CASE g % 4 WHEN 0 THEN 'producto' WHEN 1 THEN 'venta' WHEN 2 THEN 'compra' ELSE 'cliente' END,
         gen_random_uuid(), '{}'::jsonb, 'SEED', now() - (g || ' hours')::interval
       FROM generate_series(1,50) g;`,
      [T],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    const T = this.T;
    await q.query(`DELETE FROM auditoria WHERE ip = 'SEED';`);
    await q.query(`DELETE FROM detalle_venta WHERE tienda_id=$1 AND venta_id IN (SELECT id FROM venta WHERE numero_venta LIKE 'V-%');`, [T]);
    await q.query(`DELETE FROM detalle_compra WHERE tienda_id=$1 AND compra_id IN (SELECT id FROM compra WHERE numero_compra LIKE 'C-%');`, [T]);
    await q.query(`DELETE FROM credito_cliente WHERE tienda_id=$1 AND venta_id IN (SELECT id FROM venta WHERE numero_venta LIKE 'V-%');`, [T]);
    await q.query(`DELETE FROM credito_proveedor WHERE tienda_id=$1 AND compra_id IN (SELECT id FROM compra WHERE numero_compra LIKE 'C-%');`, [T]);
    await q.query(`DELETE FROM venta WHERE tienda_id=$1 AND numero_venta LIKE 'V-%';`, [T]);
    await q.query(`DELETE FROM compra WHERE tienda_id=$1 AND numero_compra LIKE 'C-%';`, [T]);
    await q.query(`DELETE FROM lote WHERE tienda_id=$1 AND codigo_lote LIKE 'LOTE-%';`, [T]);
    await q.query(`DELETE FROM producto WHERE tienda_id=$1 AND nombre LIKE 'Producto %';`, [T]);
    await q.query(`DELETE FROM usuario WHERE tienda_id=$1 AND username LIKE 'user%';`, [T]);
    await q.query(`DELETE FROM cliente WHERE tienda_id=$1 AND nombre LIKE 'Cliente %';`, [T]);
    await q.query(`DELETE FROM proveedor WHERE tienda_id=$1 AND nombre LIKE 'Proveedor %';`, [T]);
    await q.query(`DELETE FROM tipo_producto WHERE tienda_id=$1 AND nombre LIKE 'Categoría %';`, [T]);
    await q.query(`DELETE FROM marca WHERE tienda_id=$1 AND nombre LIKE 'Marca %';`, [T]);
  }
}
