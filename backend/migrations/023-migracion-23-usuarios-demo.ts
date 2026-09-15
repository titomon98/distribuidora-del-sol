import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 23: usuarios demo para mostrar el sistema por rol.
 * Idempotente (UUID fijo + ON CONFLICT). Credenciales:
 *   cajero   / cajero123     (rol CAJERO)
 *   despacho / despacho123   (rol DESPACHADOR)
 * El admin (admin / admin123) ya lo crea la migración 019.
 */
export class Migracion23UsuariosDemo1700000000023 implements MigrationInterface {
  name = 'Migracion23UsuariosDemo1700000000023';

  private readonly TIENDA = '00000000-0000-0000-0000-000000000001';
  private readonly ROL_CAJERO = '00000000-0000-0000-0000-000000000012';
  private readonly ROL_DESPACHADOR = '00000000-0000-0000-0000-000000000013';
  private readonly CAJERO = '00000000-0000-0000-0000-000000000041';
  private readonly DESPACHO = '00000000-0000-0000-0000-000000000042';
  // bcrypt (10 rounds)
  private readonly HASH_CAJERO =
    '$2b$10$G6ET4MFtYoVOTH7MKmXtleANZIarYqvkHCAwTB1FPqeAifzzjLaWm'; // cajero123
  private readonly HASH_DESPACHO =
    '$2b$10$1E4OwHeHz.3wN5vADZYMmuUS8eWaA9L2DbUb9cXUY3LgM4PdfOCSS'; // despacho123

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `INSERT INTO usuario (id, tienda_id, rol_id, nombre, username, email, password_hash, estado)
       VALUES
        ($1, $3, $4, 'Cajero Demo', 'cajero', 'cajero@distribuidora.local', $6, 'ACTIVO'),
        ($2, $3, $5, 'Despachador Demo', 'despacho', 'despacho@distribuidora.local', $7, 'ACTIVO')
       ON CONFLICT (id) DO NOTHING;`,
      [
        this.CAJERO, this.DESPACHO, this.TIENDA,
        this.ROL_CAJERO, this.ROL_DESPACHADOR,
        this.HASH_CAJERO, this.HASH_DESPACHO,
      ],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM usuario WHERE id IN ($1, $2);`, [this.CAJERO, this.DESPACHO]);
  }
}
