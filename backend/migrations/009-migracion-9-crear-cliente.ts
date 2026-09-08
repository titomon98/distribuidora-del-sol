import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 9: tabla `cliente`.
 * Incluye `es_cf` para marcar el cliente Consumidor Final por defecto de la
 * tienda (se crea en la migración de datos iniciales).
 */
export class Migracion9CrearCliente0009 implements MigrationInterface {
  name = 'Migracion9CrearCliente0009';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS cliente (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id   UUID NOT NULL REFERENCES tienda(id),
        nombre      VARCHAR(150) NOT NULL,
        nit         VARCHAR(30),
        telefono    VARCHAR(30),
        direccion   VARCHAR(255),
        email       VARCHAR(150),
        es_cf       BOOLEAN NOT NULL DEFAULT false,
        estado      VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by  UUID,
        updated_by  UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_cliente_tienda ON cliente (tienda_id);`,
    );
    // Un solo cliente CF por tienda.
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_cliente_cf_por_tienda ON cliente (tienda_id) WHERE es_cf = true;`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS cliente;`);
  }
}
