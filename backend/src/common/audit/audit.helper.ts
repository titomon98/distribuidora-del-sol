import { DataSource, EntityManager } from 'typeorm';

export interface AuditarInput {
  usuarioId: string | null;
  tiendaId: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  tabla: string;
  registroId?: string | null;
  datosNuevos?: unknown;
}

/**
 * Inserta un registro en `auditoria` desde SQL crudo.
 *
 * El `AuditSubscriber` de TypeORM sólo audita operaciones hechas con el
 * EntityManager; las ventas/compras se escriben con SQL directo (por la
 * transacción FIFO), así que estas se auditan explícitamente con este helper
 * dentro de la misma transacción.
 */
export async function auditar(
  ejecutor: EntityManager | DataSource,
  a: AuditarInput,
): Promise<void> {
  await ejecutor.query(
    `INSERT INTO auditoria (usuario_id, tienda_id, accion, tabla, registro_id, datos_nuevos, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, now());`,
    [
      a.usuarioId,
      a.tiendaId,
      a.accion,
      a.tabla,
      a.registroId ?? null,
      a.datosNuevos != null ? JSON.stringify(a.datosNuevos) : null,
    ],
  );
}
