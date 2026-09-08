import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** CreditoCliente: crédito que se le da a los clientes, con su saldo. */
@Entity({ name: 'credito_cliente' })
export class CreditoCliente extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId: string;

  @Column({ type: 'uuid', name: 'venta_id', nullable: true })
  ventaId?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'monto_total', default: 0 })
  montoTotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  saldo: string;

  @Column({ type: 'date', name: 'fecha_vencimiento', nullable: true })
  fechaVencimiento?: string | null;
}
