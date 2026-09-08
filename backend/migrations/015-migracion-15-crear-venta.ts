import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 15: tabla `venta`.
 * `estado_despacho` coordina cobro y despacho en tiempo real.
 * `idempotency_key` único (parcial) evita duplicar la venta por doble click.
 */
export class Migracion15CrearVenta0015 implements MigrationInterface {
  name = 'Migracion15CrearVenta0015';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS venta (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id       UUID NOT NULL REFERENCES tienda(id),
        cliente_id      UUID NOT NULL REFERENCES cliente(id),
        usuario_id      UUID NOT NULL REFERENCES usuario(id),
        numero_venta    VARCHAR(40),
        fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
        subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
        descuento       NUMERIC(12,2) NOT NULL DEFAULT 0,
        total           NUMERIC(12,2) NOT NULL DEFAULT 0,
        metodo_pago     VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
        tipo            VARCHAR(20) NOT NULL DEFAULT 'CONTADO',
        estado_despacho VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        idempotency_key VARCHAR(255),
        estado          VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by      UUID,
        updated_by      UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_venta_tienda_fecha ON venta (tienda_id, fecha);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_venta_estado_despacho ON venta (estado_despacho);`,
    );
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_venta_idempotency ON venta (idempotency_key) WHERE idempotency_key IS NOT NULL;`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS venta;`);
  }
}
