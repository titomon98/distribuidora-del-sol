import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** DetalleVenta: detalle de lo que se vendió (producto + venta como FK). */
@Entity({ name: 'detalle_venta' })
export class DetalleVenta extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'venta_id' })
  ventaId: string;

  @Column({ type: 'uuid', name: 'producto_id' })
  productoId: string;

  @Column({ type: 'uuid', name: 'lote_id', nullable: true })
  loteId?: string | null;

  @Column({ type: 'int', default: 0 })
  cantidad: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_unitario', default: 0 })
  precioUnitario: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;
}
