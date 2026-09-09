import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../entities/venta.entity';
import { DetalleVenta } from '../entities/detalle-venta.entity';
import { Producto } from '../entities/producto.entity';

export interface ProductoVendido {
  nombre: string;
  cantidad: number;
}

/** Capa de acceso a datos del dashboard: agrega ventas y productos. */
@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(Venta)
    private readonly ventas: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalles: Repository<DetalleVenta>,
  ) {}

  /** Ventas ACTIVAS de hoy: total facturado y número de ventas. */
  async ventasHoy(tiendaId: string): Promise<{ total: number; cantidad: number }> {
    const row = await this.ventas
      .createQueryBuilder('v')
      .select('COALESCE(SUM(v.total), 0)', 'total')
      .addSelect('COUNT(*)', 'cantidad')
      .where('v.tienda_id = :tiendaId', { tiendaId })
      .andWhere('v.estado = :estado', { estado: 'ACTIVO' })
      .andWhere("v.fecha >= date_trunc('day', now())")
      .getRawOne();
    return { total: Number(row.total), cantidad: Number(row.cantidad) };
  }

  /** Ventas de hoy por estado de despacho (DESPACHADO / PENDIENTE). */
  async despachoHoy(tiendaId: string, estadoDespacho: string): Promise<number> {
    const row = await this.ventas
      .createQueryBuilder('v')
      .select('COUNT(*)', 'cantidad')
      .where('v.tienda_id = :tiendaId', { tiendaId })
      .andWhere('v.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('v.estado_despacho = :ed', { ed: estadoDespacho })
      .andWhere("v.fecha >= date_trunc('day', now())")
      .getRawOne();
    return Number(row.cantidad);
  }

  /** Conteo de productos con stock bajo o agotado (alertas de inventario). */
  async alertasStock(tiendaId: string): Promise<{ bajo: number; agotado: number }> {
    const rows = await this.ventas.query(
      `SELECT
         COUNT(*) FILTER (WHERE stock <= 0)::int AS agotado,
         COUNT(*) FILTER (WHERE stock > 0 AND stock <= stock_minimo)::int AS bajo
       FROM (
         SELECT p.stock_minimo, COALESCE(SUM(l.cantidad_disponible),0) AS stock
         FROM producto p
         LEFT JOIN lote l ON l.producto_id = p.id AND l.estado='ACTIVO'
         WHERE p.tienda_id=$1 AND p.estado<>'ELIMINADO'
         GROUP BY p.id, p.stock_minimo
       ) s;`,
      [tiendaId],
    );
    return { bajo: rows[0]?.bajo ?? 0, agotado: rows[0]?.agotado ?? 0 };
  }

  /** Top de productos por cantidad vendida (histórico). */
  async productosMasVendidos(tiendaId: string, limite = 5): Promise<ProductoVendido[]> {
    const rows = await this.detalles
      .createQueryBuilder('dv')
      .innerJoin(Producto, 'p', 'p.id = dv.producto_id')
      .select('p.nombre', 'nombre')
      .addSelect('COALESCE(SUM(dv.cantidad), 0)', 'cantidad')
      .where('dv.tienda_id = :tiendaId', { tiendaId })
      .andWhere('dv.estado = :estado', { estado: 'ACTIVO' })
      .groupBy('p.id')
      .addGroupBy('p.nombre')
      .orderBy('cantidad', 'DESC')
      .limit(limite)
      .getRawMany();
    return rows.map((r) => ({ nombre: r.nombre, cantidad: Number(r.cantidad) }));
  }
}
