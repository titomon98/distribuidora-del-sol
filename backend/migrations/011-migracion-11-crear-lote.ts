import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 11: tabla `lote`.
 * Lotes de producto que ingresan; `cantidad_disponible` sostiene la existencia.
 */
export class Migracion11CrearLote0011 implements MigrationInterface {
  name = 'Migracion11CrearLote0011';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS lote (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id             UUID NOT NULL REFERENCES tienda(id),
        producto_id           UUID NOT NULL REFERENCES producto(id),
        codigo_lote           VARCHAR(60),
        cantidad_inicial      INT NOT NULL DEFAULT 0,
        cantidad_disponible   INT NOT NULL DEFAULT 0,
        costo_unitario        NUMERIC(12,2) NOT NULL DEFAULT 0,
        fecha_ingreso         DATE,
        fecha_vencimiento     DATE,
        estado                VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by            UUID,
        updated_by            UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_lote_producto ON lote (producto_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS lote;`);
  }
}
