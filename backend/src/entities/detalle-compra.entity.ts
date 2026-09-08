import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** DetalleCompra: detalle de lo que se compró (producto + compra como FK). */
@Entity({ name: 'detalle_compra' })
export class DetalleCompra extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'compra_id' })
  compraId: string;

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
