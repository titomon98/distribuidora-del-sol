import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

/**
 * Tienda: engloba todo. Hoy hay una sola, pero el diseño permite más de una
 * y migrar registros entre tiendas en el futuro.
 */
@Entity({ name: 'tienda' })
export class Tienda extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nit?: string | null;
}
