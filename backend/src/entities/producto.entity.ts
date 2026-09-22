import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/**
 * Producto: una de las entidades más importantes.
 * Maneja precio_compra (referencia; el costo real por ingreso vive en el lote /
 * detalle de compra), precio_mayorista, precio_venta y codigo_barras.
 * `stockMinimo` habilita las alertas de existencia baja.
 *
 * Los montos son numeric(12,2); pg los devuelve como string.
 */
@Entity({ name: 'producto' })
@Index('ux_producto_tienda_codigo_barras', ['tiendaId', 'codigoBarras'], {
  unique: true,
  where: '"codigo_barras" IS NOT NULL',
})
export class Producto extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'marca_id', nullable: true })
  marcaId?: string | null;

  @Column({ type: 'uuid', name: 'tipo_producto_id', nullable: true })
  tipoProductoId?: string | null;

  @Column({ type: 'uuid', name: 'presentacion_id', nullable: true })
  presentacionId?: string | null;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;

  @Column({ type: 'varchar', length: 60, name: 'codigo_barras', nullable: true })
  codigoBarras?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_compra', default: 0 })
  precioCompra: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_mayorista', default: 0 })
  precioMayorista: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'precio_venta', default: 0 })
  precioVenta: string;

  @Column({ type: 'int', name: 'stock_minimo', default: 0 })
  stockMinimo: number;
}
