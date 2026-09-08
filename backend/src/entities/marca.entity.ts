import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** Marca: marcas de los productos. */
@Entity({ name: 'marca' })
@Index('ux_marca_tienda_nombre', ['tiendaId', 'nombre'], { unique: true })
export class Marca extends BaseTiendaEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;
}
