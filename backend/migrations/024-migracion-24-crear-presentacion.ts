import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 24: tabla `presentacion` (presentacion/empaque del producto, por tienda)
 * + columna `presentacion_id` en `producto` (FK opcional, igual que marca/tipo).
 */
export class Migracion24CrearPresentacion1700000000024 implements MigrationInterface {
  name = 'Migracion24CrearPresentacion1700000000024';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS presentacion (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id   UUID NOT NULL REFERENCES tienda(id),
        nombre      VARCHAR(120) NOT NULL,
        descripcion VARCHAR(255),
        estado      VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by  UUID,
        updated_by  UUID
      );
    `);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_presentacion_tienda_nombre ON presentacion (tienda_id, nombre);`,
    );
    await q.query(
      `ALTER TABLE producto ADD COLUMN IF NOT EXISTS presentacion_id UUID REFERENCES presentacion(id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE producto DROP COLUMN IF EXISTS presentacion_id;`);
    await q.query(`DROP TABLE IF EXISTS presentacion;`);
  }
}
