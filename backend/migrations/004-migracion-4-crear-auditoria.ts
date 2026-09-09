import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 4: tabla `auditoria` (append-only).
 * Guarda quién realizó qué acción sobre qué tabla y registro, con datos
 * anteriores y nuevos.
 */
export class Migracion4CrearAuditoria1700000000004 implements MigrationInterface {
  name = 'Migracion4CrearAuditoria1700000000004';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id        UUID REFERENCES usuario(id),
        tienda_id         UUID REFERENCES tienda(id),
        accion            VARCHAR(20) NOT NULL,
        tabla             VARCHAR(60) NOT NULL,
        registro_id       UUID,
        datos_anteriores  JSONB,
        datos_nuevos      JSONB,
        ip                VARCHAR(60),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_auditoria_tabla_registro ON auditoria (tabla, registro_id);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS ix_auditoria_usuario ON auditoria (usuario_id);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS auditoria;`);
  }
}
