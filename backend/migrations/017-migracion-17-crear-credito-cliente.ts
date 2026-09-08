import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 17: tabla `credito_cliente` (crédito otorgado a clientes). */
export class Migracion17CrearCreditoCliente0017 implements MigrationInterface {
  name = 'Migracion17CrearCreditoCliente0017';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS credito_cliente (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id         UUID NOT NULL REFERENCES tienda(id),
        cliente_id        UUID NOT NULL REFERENCES cliente(id),
        venta_id          UUID REFERENCES venta(id),
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
      `CREATE INDEX IF NOT EXISTS ix_credito_cliente_cliente ON credito_cliente (cliente_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS credito_cliente;`);
  }
}
