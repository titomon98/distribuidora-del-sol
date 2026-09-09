import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { Auditoria } from './auditoria.entity';

/**
 * Suscriptor global que escribe en la bitácora `auditoria` en cada
 * INSERT / UPDATE / DELETE de cualquier entidad.
 *
 * Se ignoran las tablas de infraestructura (`auditoria`, `idempotency_key` y la
 * tabla de migraciones) para no auditarse a sí mismo ni entrar en recursión.
 *
 * El `usuario_id` se toma del actor que la capa de negocio ya escribe en la
 * entidad (`created_by` al insertar, `updated_by` al actualizar/eliminar). Así
 * la bitácora registra quién hizo cada cambio sin acoplar el subscriber al
 * request. Queda null solo si el cambio no trae actor (p.ej. seeds).
 */
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private static readonly IGNORAR = new Set([
    'auditoria',
    'idempotency_key',
    'migraciones_ejecutadas',
  ]);

  private tabla(metadataTableName: string): string {
    return metadataTableName;
  }

  private debeIgnorar(tabla: string): boolean {
    return AuditSubscriber.IGNORAR.has(tabla);
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    const tabla = this.tabla(event.metadata.tableName);
    if (this.debeIgnorar(tabla)) return;
    await event.manager.getRepository(Auditoria).insert({
      accion: 'INSERT',
      tabla,
      registroId: event.entity?.id ?? null,
      tiendaId: event.entity?.tiendaId ?? null,
      usuarioId: event.entity?.createdBy ?? event.entity?.updatedBy ?? null,
      datosNuevos: event.entity ?? null,
    } as any);
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    const tabla = this.tabla(event.metadata.tableName);
    if (this.debeIgnorar(tabla)) return;
    await event.manager.getRepository(Auditoria).insert({
      accion: 'UPDATE',
      tabla,
      registroId: (event.entity as any)?.id ?? (event.databaseEntity as any)?.id ?? null,
      tiendaId: (event.entity as any)?.tiendaId ?? null,
      usuarioId: (event.entity as any)?.updatedBy ?? (event.databaseEntity as any)?.updatedBy ?? null,
      datosAnteriores: event.databaseEntity ?? null,
      datosNuevos: event.entity ?? null,
    } as any);
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    const tabla = this.tabla(event.metadata.tableName);
    if (this.debeIgnorar(tabla)) return;
    await event.manager.getRepository(Auditoria).insert({
      accion: 'DELETE',
      tabla,
      registroId: (event.databaseEntity as any)?.id ?? null,
      tiendaId: (event.databaseEntity as any)?.tiendaId ?? null,
      usuarioId: (event.databaseEntity as any)?.updatedBy ?? null,
      datosAnteriores: event.databaseEntity ?? null,
    } as any);
  }
}
