import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { CrudService } from '../common/crud/crud.service';

/** Capa de negocio de productos: CRUD genérico + lectura por código de barras. */
@Injectable()
export class ProductosService extends CrudService<Producto> {
  constructor(
    @InjectRepository(Producto) repo: Repository<Producto>,
  ) {
    super(repo, 'Producto');
  }

  /** Lista de productos con conteo de lotes (con stock) para el catálogo. */
  listarConLotes(tiendaId: string, search?: string): Promise<any[]> {
    return this.repo.query(
      `SELECT p.id, p.nombre, p.descripcion, p.estado,
              p.codigo_barras AS "codigoBarras", p.marca_id AS "marcaId",
              p.tipo_producto_id AS "tipoProductoId", p.precio_compra AS "precioCompra",
              p.precio_mayorista AS "precioMayorista", p.precio_venta AS "precioVenta",
              p.stock_minimo AS "stockMinimo",
              COALESCE(SUM(l.cantidad_disponible), 0)::int AS stock,
              COUNT(l.id) FILTER (WHERE l.cantidad_disponible > 0)::int AS lotes
       FROM producto p
       LEFT JOIN lote l ON l.producto_id = p.id AND l.estado = 'ACTIVO'
       WHERE p.tienda_id = $1 AND p.estado <> 'ELIMINADO'
         AND ($2::text IS NULL OR p.nombre ILIKE '%'||$2||'%' OR p.codigo_barras ILIKE '%'||$2||'%')
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT CASE WHEN $2::text IS NULL THEN 1000 ELSE 50 END;`,
      [tiendaId, search || null],
    );
  }

  async getByBarcode(tiendaId: string, codigo: string): Promise<Producto> {
    const producto = await this.repo.findOne({
      where: { tiendaId, codigoBarras: codigo, estado: 'ACTIVO' },
    });
    if (!producto) {
      throw new NotFoundException(`No hay un producto con el código ${codigo}`);
    }
    return producto;
  }
}
