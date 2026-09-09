import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 13: tabla `detalle_compra` (producto + compra como FK). */
export class Migracion13CrearDetalleCompra1700000000013 implements MigrationInterface {
  name = 'Migracion13CrearDetalleCompra1700000000013';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS detalle_compra (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id       UUID NOT NULL REFERENCES tienda(id),
        compra_id       UUID NOT NULL REFERENCES compra(id),
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
      `CREATE INDEX IF NOT EXISTS ix_detalle_compra_compra ON detalle_compra (compra_id);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_detalle_compra_producto ON detalle_compra (producto_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS detalle_compra;`);
  }
}
