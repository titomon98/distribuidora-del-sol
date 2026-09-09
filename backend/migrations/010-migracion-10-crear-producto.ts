import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 10: tabla `producto`.
 * Precios (compra, mayorista, venta), codigo_barras y stock_minimo para
 * alertas de existencia baja. FK opcionales a marca y tipo_producto.
 */
export class Migracion10CrearProducto1700000000010 implements MigrationInterface {
  name = 'Migracion10CrearProducto1700000000010';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS producto (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id         UUID NOT NULL REFERENCES tienda(id),
        marca_id          UUID REFERENCES marca(id),
        tipo_producto_id  UUID REFERENCES tipo_producto(id),
        nombre            VARCHAR(200) NOT NULL,
        descripcion       VARCHAR(255),
        codigo_barras     VARCHAR(60),
        precio_compra     NUMERIC(12,2) NOT NULL DEFAULT 0,
        precio_mayorista  NUMERIC(12,2) NOT NULL DEFAULT 0,
        precio_venta      NUMERIC(12,2) NOT NULL DEFAULT 0,
        stock_minimo      INT NOT NULL DEFAULT 0,
        estado            VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by        UUID,
        updated_by        UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_producto_tienda ON producto (tienda_id);`,
    );
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_producto_tienda_codigo_barras ON producto (tienda_id, codigo_barras) WHERE codigo_barras IS NOT NULL;`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS producto;`);
  }
}
