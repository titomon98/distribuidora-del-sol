import { MigrationInterface, QueryRunner } from 'typeorm';

/** Migración 3: tabla `usuario` (FK a tienda y rol). */
export class Migracion3CrearUsuario0003 implements MigrationInterface {
  name = 'Migracion3CrearUsuario0003';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tienda_id     UUID NOT NULL REFERENCES tienda(id),
        rol_id        UUID NOT NULL REFERENCES rol(id),
        nombre        VARCHAR(150) NOT NULL,
        username      VARCHAR(60) NOT NULL,
        email         VARCHAR(150),
        password_hash VARCHAR(255) NOT NULL,
        estado        VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by    UUID,
        updated_by    UUID
      );
    `);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_username ON usuario (username);`,
    );
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_email ON usuario (email) WHERE email IS NOT NULL;`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_usuario_tienda ON usuario (tienda_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS usuario;`);
  }
}
