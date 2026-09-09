import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';

/** Acceso a datos de inventario (existencias y movimientos). */
@Injectable()
export class InventarioRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly productos: Repository<Producto>,
  ) {}

  /** Existencias por producto: stock = suma de cantidad_disponible de sus lotes. */
  existencias(tiendaId: string): Promise<any[]> {
    return this.productos.query(
      `SELECT p.id, p.nombre, p.codigo_barras AS "codigoBarras",
              p.stock_minimo AS "stockMinimo",
              COALESCE(SUM(l.cantidad_disponible), 0)::int AS stock,
              COUNT(l.id) FILTER (WHERE l.cantidad_disponible > 0)::int AS lotes,
              p.precio_venta AS "precioVenta"
       FROM producto p
       LEFT JOIN lote l ON l.producto_id = p.id AND l.estado = 'ACTIVO'
       WHERE p.tienda_id = $1 AND p.estado <> 'ELIMINADO'
       GROUP BY p.id
       ORDER BY p.nombre;`,
      [tiendaId],
    );
  }

  /** Lotes de un producto (para ver el desglose de existencias). */
  lotesDeProducto(tiendaId: string, productoId: string): Promise<any[]> {
    return this.productos.query(
      `SELECT l.codigo_lote AS "codigoLote", l.cantidad_inicial AS "cantidadInicial",
              l.cantidad_disponible AS "cantidadDisponible", l.costo_unitario AS "costoUnitario",
              l.fecha_ingreso AS "fechaIngreso", l.fecha_vencimiento AS "fechaVencimiento"
       FROM lote l
       WHERE l.tienda_id = $1 AND l.producto_id = $2 AND l.estado = 'ACTIVO'
       ORDER BY l.fecha_ingreso ASC NULLS LAST, l.created_at ASC;`,
      [tiendaId, productoId],
    );
  }

  /** Historial de entradas (compras) y salidas (ventas), más recientes primero. */
  movimientos(tiendaId: string, limite = 200): Promise<any[]> {
    return this.productos.query(
      `(SELECT c.fecha, 'ENTRADA' AS tipo, p.nombre AS producto,
               dc.cantidad, u.nombre AS usuario
        FROM detalle_compra dc
        JOIN compra c   ON c.id = dc.compra_id
        JOIN producto p ON p.id = dc.producto_id
        LEFT JOIN usuario u ON u.id = c.usuario_id
        WHERE dc.tienda_id = $1 AND dc.estado <> 'ELIMINADO')
       UNION ALL
       (SELECT v.fecha, 'SALIDA' AS tipo, p.nombre AS producto,
               dv.cantidad, u.nombre AS usuario
        FROM detalle_venta dv
        JOIN venta v    ON v.id = dv.venta_id
        JOIN producto p ON p.id = dv.producto_id
        LEFT JOIN usuario u ON u.id = v.usuario_id
        WHERE dv.tienda_id = $1 AND dv.estado <> 'ELIMINADO')
       ORDER BY fecha DESC
       LIMIT $2;`,
      [tiendaId, limite],
    );
  }
}
