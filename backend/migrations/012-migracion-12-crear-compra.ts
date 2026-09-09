import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 12: tabla `compra`.
 * `idempotency_key` único (parcial) evita duplicar la compra por doble click.
 */
export class Migracion12CrearCompra1700000000012 implements MigrationInterface {
  name = 'Migracion12CrearCompra1700000000012';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS compra (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id       UUID NOT NULL REFERENCES tienda(id),
        proveedor_id    UUID NOT NULL REFERENCES proveedor(id),
        usuario_id      UUID NOT NULL REFERENCES usuario(id),
        numero_compra   VARCHAR(40),
        fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
        subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
        impuesto        NUMERIC(12,2) NOT NULL DEFAULT 0,
        total           NUMERIC(12,2) NOT NULL DEFAULT 0,
        tipo_pago       VARCHAR(20) NOT NULL DEFAULT 'CONTADO',
        idempotency_key VARCHAR(255),
        estado          VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by      UUID,
        updated_by      UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_compra_tienda ON compra (tienda_id);`,
    );
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_compra_idempotency ON compra (idempotency_key) WHERE idempotency_key IS NOT NULL;`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS compra;`);
  }
}
