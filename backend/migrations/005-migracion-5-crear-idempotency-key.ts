import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 5: tabla `idempotency_key`.
 * Soporta la idempotencia de la app: varios clicks al mismo botón usan la misma
 * clave y solo la primera petición ejecuta la operación. El índice ÚNICO sobre
 * `clave` es la garantía contra escrituras concurrentes duplicadas.
 */
export class Migracion5CrearIdempotencyKey1700000000005 implements MigrationInterface {
  name = 'Migracion5CrearIdempotencyKey1700000000005';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS idempotency_key (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clave           VARCHAR(255) NOT NULL,
        usuario_id      UUID REFERENCES usuario(id),
        metodo          VARCHAR(10),
        endpoint        VARCHAR(255),
        request_hash    VARCHAR(128),
        response_status INT,
        response_body   JSONB,
        estado          VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at      TIMESTAMPTZ
      );
    `);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS ux_idempotency_clave ON idempotency_key (clave);`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS idempotency_key;`);
  }
}
