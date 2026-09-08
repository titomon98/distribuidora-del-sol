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
 * El `usuario_id` / `ip` reales se completarán vía contexto de request cuando
 * se conecten los módulos (por ahora quedan en null si no hay actor conocido).
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
      createdBy: undefined,
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
      datosAnteriores: event.databaseEntity ?? null,
    } as any);
  }
}
