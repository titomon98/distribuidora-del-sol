import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 16: tabla `detalle_venta` (producto + venta como FK). */
export class Migracion16CrearDetalleVenta1700000000016 implements MigrationInterface {
  name = 'Migracion16CrearDetalleVenta1700000000016';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS detalle_venta (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id       UUID NOT NULL REFERENCES tienda(id),
        venta_id        UUID NOT NULL REFERENCES venta(id),
        producto_id     UUID NOT NULL REFERENCES producto(id),
        lote_id         UUID REFERENCES lote(id),
        cantidad        INT NOT NULL DEFAULT 0,
        precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
        subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
        estado          VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by      UUID,
        updated_by      UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_detalle_venta_venta ON detalle_venta (venta_id);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_detalle_venta_producto ON detalle_venta (producto_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS detalle_venta;`);
  }
}
