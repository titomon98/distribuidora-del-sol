import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 19: usuario administrador inicial (seed).
 * Idempotente: usa un UUID fijo + ON CONFLICT para no duplicar.
 * Credenciales de arranque: usuario `admin`, contraseña `admin123`
 * (cambiarla desde la app en cuanto haya gestión de usuarios).
 */
export class Migracion19UsuarioAdmin1700000000019 implements MigrationInterface {
  name = 'Migracion19UsuarioAdmin1700000000019';

  private readonly ADMIN = '00000000-0000-0000-0000-000000000031';
  private readonly TIENDA = '00000000-0000-0000-0000-000000000001';
  private readonly ROL_ADMIN = '00000000-0000-0000-0000-000000000011';
  // bcrypt de 'admin123' (10 rounds).
  private readonly HASH =
    '$2b$10$B62f0a8dStIeKcJH/eB5hOaL8kmCTm3h25FFCOdreYsnxhNYGbxLa';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `INSERT INTO usuario (id, tienda_id, rol_id, nombre, username, email, password_hash, estado)
       VALUES ($1, $2, $3, 'Administrador', 'admin', 'admin@distribuidora.local', $4, 'ACTIVO')
       ON CONFLICT (id) DO NOTHING;`,
      [this.ADMIN, this.TIENDA, this.ROL_ADMIN, this.HASH],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM usuario WHERE id = $1;`, [this.ADMIN]);
  }
}
