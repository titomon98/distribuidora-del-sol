import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** Presentacion: presentacion/empaque del producto (ej. botella 600ml, caja 12u). */
@Entity({ name: 'presentacion' })
@Index('ux_presentacion_tienda_nombre', ['tiendaId', 'nombre'], { unique: true })
export class Presentacion extends BaseTiendaEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;
}
