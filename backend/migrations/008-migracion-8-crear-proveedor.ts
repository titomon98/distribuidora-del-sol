import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 8: tabla `proveedor`. */
export class Migracion8CrearProveedor1700000000008 implements MigrationInterface {
  name = 'Migracion8CrearProveedor1700000000008';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS proveedor (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id   UUID NOT NULL REFERENCES tienda(id),
        nombre      VARCHAR(150) NOT NULL,
        nit         VARCHAR(30),
        telefono    VARCHAR(30),
        direccion   VARCHAR(255),
        email       VARCHAR(150),
        estado      VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by  UUID,
        updated_by  UUID
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_proveedor_tienda ON proveedor (tienda_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS proveedor;`);
  }
}
