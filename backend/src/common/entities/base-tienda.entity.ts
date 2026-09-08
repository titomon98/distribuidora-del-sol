import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Igual que BaseEntity pero con `tienda_id`.
 *
 * Toda tabla de dominio pertenece a una tienda. Hoy existe una sola tienda,
 * pero el campo permite migrar registros de una tienda a otra en el futuro
 * y habilitar más sucursales sin rediseñar el esquema.
 */
export abstract class BaseTiendaEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tienda_id' })
  tiendaId: string;
}
