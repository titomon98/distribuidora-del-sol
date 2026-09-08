import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * Venta: registra todas las ventas del día.
 * `estadoDespacho` coordina el punto de cobro y el punto de despacho en tiempo
 * real (PENDIENTE / DESPACHADO). `idempotencyKey` (único) evita duplicar la
 * venta por doble click en el botón de cobrar.
 */
@Entity({ name: 'venta' })
export class Venta extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'cliente_id' })
  clienteId: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 40, name: 'numero_venta', nullable: true })
  numeroVenta?: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  descuento: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  // EFECTIVO | TARJETA | TRANSFERENCIA | ...
  @Column({ type: 'varchar', length: 20, name: 'metodo_pago', default: 'EFECTIVO' })
  metodoPago: string;

  // CONTADO | CREDITO
  @Column({ type: 'varchar', length: 20, default: 'CONTADO' })
  tipo: string;

  // PENDIENTE | DESPACHADO
  @Column({ type: 'varchar', length: 20, name: 'estado_despacho', default: 'PENDIENTE' })
  estadoDespacho: string;

  @Index('ux_venta_idempotency', { unique: true, where: '"idempotency_key" IS NOT NULL' })
  @Column({ type: 'varchar', length: 255, name: 'idempotency_key', nullable: true })
  idempotencyKey?: string | null;
}
