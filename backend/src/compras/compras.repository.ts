import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { auditar } from '../common/audit/audit.helper';

export interface ItemCompra {
  productoId: string;
  cantidad: number;
  costoUnitario: number;
  /** Opcional: fecha de vencimiento del lote (algunos productos no vencen). */
  fechaVencimiento?: string;
}
export interface CrearCompraInput {
  proveedorId: string;
  tipoPago?: string;
  /** Monto pagado de inmediato. Si es menor al total, el resto queda a crédito. */
  montoPagado?: number;
  items: ItemCompra[];
  idempotencyKey?: string;
}

/**
 * Acceso a datos de compras. Registrar una compra es una ENTRADA de inventario:
 * crea la compra, su detalle y un lote nuevo por renglón (stock disponible),
 * todo en una transacción y auditado. Los lotes nuevos entran al final del
 * orden FIFO (fecha_ingreso = hoy).
 */
@Injectable()
export class ComprasRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async crear(tiendaId: string, userId: string, dto: CrearCompraInput) {
    return this.ds.transaction(async (m) => {
      if (dto.idempotencyKey) {
        const prev = await m.query(
          `SELECT id FROM compra WHERE tienda_id=$1 AND idempotency_key=$2 LIMIT 1;`,
          [tiendaId, dto.idempotencyKey],
        );
        if (prev.length) return this.detalle(tiendaId, prev[0].id, m);
      }

      const subtotal = dto.items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0);
      // Pago parcial: lo no pagado queda como crédito con el proveedor.
      const pagado = Math.min(Math.max(dto.montoPagado ?? subtotal, 0), subtotal);
      const saldo = +(subtotal - pagado).toFixed(2);
      const tipoPago = saldo > 0 ? 'CREDITO' : (dto.tipoPago ?? 'CONTADO');

      const compraRows = await m.query(
        `INSERT INTO compra (tienda_id, proveedor_id, usuario_id, numero_compra, subtotal,
                             impuesto, total, tipo_pago, idempotency_key, created_by)
         VALUES ($1,$2,$3, 'C-'||to_char(now(),'YYYYMMDD')||'-'||substr(md5(random()::text),1,6),
                 $4, 0, $4, $5, $6, $3)
         RETURNING id;`,
        [tiendaId, dto.proveedorId, userId, subtotal, tipoPago, dto.idempotencyKey ?? null],
      );
      const compraId = compraRows[0].id;

      if (saldo > 0) {
        await m.query(
          `INSERT INTO credito_proveedor (tienda_id, proveedor_id, compra_id, monto_total, saldo, created_by)
           VALUES ($1,$2,$3,$4,$5,$6);`,
          [tiendaId, dto.proveedorId, compraId, subtotal, saldo, userId],
        );
      }

      for (const item of dto.items) {
        // Lote nuevo = entrada de stock.
        const loteRows = await m.query(
          `INSERT INTO lote (tienda_id, producto_id, codigo_lote, cantidad_inicial,
                             cantidad_disponible, costo_unitario, fecha_ingreso, fecha_vencimiento, created_by)
           VALUES ($1,$2,'LOTE-'||substr(md5(random()::text),1,8),$3,$3,$4,CURRENT_DATE,$5,$6)
           RETURNING id;`,
          [tiendaId, item.productoId, item.cantidad, item.costoUnitario, item.fechaVencimiento || null, userId],
        );
        await m.query(
          `INSERT INTO detalle_compra (tienda_id, compra_id, producto_id, lote_id, cantidad, precio_unitario, subtotal, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`,
          [tiendaId, compraId, item.productoId, loteRows[0].id, item.cantidad, item.costoUnitario, item.cantidad * item.costoUnitario, userId],
        );
      }

      await auditar(m, {
        usuarioId: userId, tiendaId, accion: 'INSERT', tabla: 'compra',
        registroId: compraId, datosNuevos: { total: subtotal, items: dto.items.length },
      });

      return this.detalle(tiendaId, compraId, m);
    });
  }

  async detalle(tiendaId: string, compraId: string, m: EntityManager | DataSource = this.ds) {
    const compra = (await m.query(
      `SELECT c.*, pr.nombre AS proveedor, u.nombre AS usuario
       FROM compra c
       LEFT JOIN proveedor pr ON pr.id = c.proveedor_id
       LEFT JOIN usuario u ON u.id = c.usuario_id
       WHERE c.tienda_id=$1 AND c.id=$2;`,
      [tiendaId, compraId],
    ))[0];
    const items = await m.query(
      `SELECT dc.cantidad, dc.precio_unitario AS "precioUnitario", dc.subtotal, p.nombre AS producto
       FROM detalle_compra dc JOIN producto p ON p.id = dc.producto_id
       WHERE dc.tienda_id=$1 AND dc.compra_id=$2;`,
      [tiendaId, compraId],
    );
    return { ...compra, items };
  }

  listar(tiendaId: string) {
    return this.ds.query(
      `SELECT c.id, c.numero_compra AS "numeroCompra", c.fecha, c.total, c.tipo_pago AS "tipoPago",
              pr.nombre AS proveedor, u.nombre AS usuario
       FROM compra c
       LEFT JOIN proveedor pr ON pr.id=c.proveedor_id
       LEFT JOIN usuario u ON u.id=c.usuario_id
       WHERE c.tienda_id=$1 AND c.estado<>'ELIMINADO'
       ORDER BY c.fecha DESC LIMIT 300;`,
      [tiendaId],
    );
  }
}
