import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * Compra: registra cada compra realizada a los proveedores.
 * `idempotencyKey` (único) evita registrar dos veces la misma compra por
 * doble click.
 */
@Entity({ name: 'compra' })
export class Compra extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'proveedor_id' })
  proveedorId: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 40, name: 'numero_compra', nullable: true })
  numeroCompra?: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  fecha: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  impuesto: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  // CONTADO | CREDITO
  @Column({ type: 'varchar', length: 20, name: 'tipo_pago', default: 'CONTADO' })
  tipoPago: string;

  @Index('ux_compra_idempotency', { unique: true, where: '"idempotency_key" IS NOT NULL' })
  @Column({ type: 'varchar', length: 255, name: 'idempotency_key', nullable: true })
  idempotencyKey?: string | null;
}
