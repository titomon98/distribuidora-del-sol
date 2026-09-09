import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 6: tabla `marca` (marcas de producto, por tienda). */
export class Migracion6CrearMarca1700000000006 implements MigrationInterface {
  name = 'Migracion6CrearMarca1700000000006';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS marca (
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
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_marca_tienda_nombre ON marca (tienda_id, nombre);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS marca;`);
  }
}
