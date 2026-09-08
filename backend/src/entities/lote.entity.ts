import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * Lote: lotes de producto que ingresan al sistema.
 * Por ahora sirven para ingresar productos y llevar la existencia disponible
 * (`cantidadDisponible`). Las existencias del producto se derivan de sus lotes.
 */
@Entity({ name: 'lote' })
export class Lote extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'producto_id' })
  productoId: string;

  @Column({ type: 'varchar', length: 60, name: 'codigo_lote', nullable: true })
  codigoLote?: string | null;

  @Column({ type: 'int', name: 'cantidad_inicial', default: 0 })
  cantidadInicial: number;

  @Column({ type: 'int', name: 'cantidad_disponible', default: 0 })
  cantidadDisponible: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'costo_unitario', default: 0 })
  costoUnitario: string;

  @Column({ type: 'date', name: 'fecha_ingreso', nullable: true })
  fechaIngreso?: string | null;

  @Column({ type: 'date', name: 'fecha_vencimiento', nullable: true })
  fechaVencimiento?: string | null;
}
