import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * Cliente: personas/clientes que compran.
 * Debe existir un cliente "CF" (Consumidor Final) por defecto en cada tienda,
 * marcado con `esCf = true`.
 */
@Entity({ name: 'cliente' })
export class Cliente extends BaseTiendaEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nit?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string | null;

  @Column({ type: 'boolean', name: 'es_cf', default: false })
  esCf: boolean;
}
