import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 22: tabla `venta_pago` para pago mixto.
 * Una venta puede pagarse con varios métodos a la vez (efectivo + tarjeta, etc.).
 * Cada renglón guarda método y monto. `venta.metodo_pago` queda como resumen
 * ('MIXTO' cuando hay más de uno).
 */
export class Migracion22VentaPago1700000000022 implements MigrationInterface {
  name = 'Migracion22VentaPago1700000000022';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS venta_pago (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id    UUID NOT NULL REFERENCES tienda(id),
        venta_id     UUID NOT NULL REFERENCES venta(id),
        metodo_pago  VARCHAR(20) NOT NULL,
        monto        NUMERIC(12,2) NOT NULL DEFAULT 0,
        estado       VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by   UUID,
        updated_by   UUID
      );
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_venta_pago_venta ON venta_pago (venta_id);`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS venta_pago;`);
  }
}
