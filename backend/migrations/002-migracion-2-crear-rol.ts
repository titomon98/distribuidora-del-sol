import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 2: tabla `rol` (roles de los usuarios del sistema). */
export class Migracion2CrearRol1700000000002 implements MigrationInterface {
  name = 'Migracion2CrearRol1700000000002';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS rol (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre      VARCHAR(60) NOT NULL,
        descripcion VARCHAR(255),
        estado      VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by  UUID,
        updated_by  UUID
      );
    `);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_rol_nombre ON rol (nombre);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS rol;`);
  }
}
