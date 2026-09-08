import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** TipoProducto: tipos/categorías de producto. */
@Entity({ name: 'tipo_producto' })
@Index('ux_tipo_producto_tienda_nombre', ['tiendaId', 'nombre'], { unique: true })
export class TipoProducto extends BaseTiendaEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;
}
