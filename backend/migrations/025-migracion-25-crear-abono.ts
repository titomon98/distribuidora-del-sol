import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 25: tabla `abono` (historial de pagos a créditos de clientes).
 * Cada abono guarda monto, método y fecha, para el cierre de caja del día y
 * el registro de abonos. El saldo del crédito se sigue actualizando aparte.
 */
export class Migracion25CrearAbono1700000000025 implements MigrationInterface {
  name = 'Migracion25CrearAbono1700000000025';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS abono (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id           UUID NOT NULL REFERENCES tienda(id),
        credito_cliente_id  UUID NOT NULL REFERENCES credito_cliente(id),
        monto               NUMERIC(12,2) NOT NULL,
        metodo_pago         VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
        fecha               TIMESTAMPTZ NOT NULL DEFAULT now(),
        estado              VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by          UUID,
        updated_by          UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_abono_tienda_fecha ON abono (tienda_id, fecha);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS abono;`);
  }
}
