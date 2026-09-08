import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * CreditoProveedor: crédito que se solicita a los proveedores.
 * Debe quedar un registro con su saldo.
 */
@Entity({ name: 'credito_proveedor' })
export class CreditoProveedor extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'proveedor_id' })
  proveedorId: string;

  @Column({ type: 'uuid', name: 'compra_id', nullable: true })
  compraId?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'monto_total', default: 0 })
  montoTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  saldo: string;

  @Column({ type: 'date', name: 'fecha_vencimiento', nullable: true })
  fechaVencimiento?: string | null;
}
