import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración 18: datos iniciales (seed).
 * Crea, de forma idempotente, la tienda por defecto, los roles base y el
 * cliente Consumidor Final (CF) por defecto. Usa UUIDs fijos + ON CONFLICT /
 * NOT EXISTS para que reejecutar la migración no duplique nada.
 */
export class Migracion18DatosIniciales0018 implements MigrationInterface {
  name = 'Migracion18DatosIniciales0018';

  private readonly TIENDA = '00000000-0000-0000-0000-000000000001';
  private readonly CLIENTE_CF = '00000000-0000-0000-0000-000000000021';

  public async up(q: QueryRunner): Promise<void> {
    // Tienda por defecto
    await q.query(
      `INSERT INTO tienda (id, nombre, estado)
       VALUES ($1, 'Distribuidora del Sol', 'ACTIVO')
       ON CONFLICT (id) DO NOTHING;`,
      [this.TIENDA],
    );

    // Roles base
    await q.query(`
      INSERT INTO rol (id, nombre, descripcion) VALUES
        ('00000000-0000-0000-0000-000000000011', 'ADMINISTRADOR', 'Acceso total; administra tiendas y usuarios'),
        ('00000000-0000-0000-0000-000000000012', 'CAJERO', 'Punto de cobro'),
        ('00000000-0000-0000-0000-000000000013', 'DESPACHADOR', 'Punto de despacho')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Cliente CF por defecto (uno por tienda: guardado con NOT EXISTS)
    await q.query(
      `INSERT INTO cliente (id, tienda_id, nombre, nit, es_cf, estado)
       SELECT $1, $2, 'Consumidor Final', 'CF', true, 'ACTIVO'
       WHERE NOT EXISTS (
         SELECT 1 FROM cliente WHERE tienda_id = $2 AND es_cf = true
       );`,
      [this.CLIENTE_CF, this.TIENDA],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM cliente WHERE id = $1;`, [this.CLIENTE_CF]);
    await q.query(
      `DELETE FROM rol WHERE id IN (
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0000-000000000013'
      );`,
    );
    await q.query(`DELETE FROM tienda WHERE id = $1;`, [this.TIENDA]);
  }
}
