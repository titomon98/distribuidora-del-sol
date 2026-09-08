import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 7: tabla `tipo_producto` (tipos de producto, por tienda). */
export class Migracion7CrearTipoProducto0007 implements MigrationInterface {
  name = 'Migracion7CrearTipoProducto0007';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS tipo_producto (
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
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_tipo_producto_tienda_nombre ON tipo_producto (tienda_id, nombre);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS tipo_producto;`);
  }
}
