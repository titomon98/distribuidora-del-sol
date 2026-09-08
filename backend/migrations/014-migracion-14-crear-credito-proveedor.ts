import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 14: tabla `credito_proveedor` (crédito solicitado a proveedores). */
export class Migracion14CrearCreditoProveedor0014 implements MigrationInterface {
  name = 'Migracion14CrearCreditoProveedor0014';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS credito_proveedor (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id         UUID NOT NULL REFERENCES tienda(id),
        proveedor_id      UUID NOT NULL REFERENCES proveedor(id),
        compra_id         UUID REFERENCES compra(id),
        monto_total       NUMERIC(12,2) NOT NULL DEFAULT 0,
        saldo             NUMERIC(12,2) NOT NULL DEFAULT 0,
        fecha_vencimiento DATE,
        estado            VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by        UUID,
        updated_by        UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_credito_proveedor_proveedor ON credito_proveedor (proveedor_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS credito_proveedor;`);
  }
}
