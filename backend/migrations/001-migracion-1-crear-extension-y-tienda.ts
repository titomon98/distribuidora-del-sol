import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 1: extensión pgcrypto (para gen_random_uuid) y tabla `tienda`.
 * La tienda engloba todo el sistema; el resto de tablas de dominio la referencian.
 */
export class Migracion1CrearExtensionYTienda0001 implements MigrationInterface {
  name = 'Migracion1CrearExtensionYTienda0001';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await q.query(`
      CREATE TABLE IF NOT EXISTS tienda (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre      VARCHAR(150) NOT NULL,
        direccion   VARCHAR(255),
        telefono    VARCHAR(30),
        nit         VARCHAR(30),
        estado      VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by  UUID,
        updated_by  UUID
      );
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS tienda;`);
  }
}
