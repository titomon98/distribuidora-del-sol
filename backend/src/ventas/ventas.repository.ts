import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { auditar } from '../common/audit/audit.helper';

export interface ItemVenta {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}
export interface PagoVenta {
  metodoPago: string;
  monto: number;
}
export interface CrearVentaInput {
  clienteId?: string;
  metodoPago?: string;
  /** Pago mixto: varios métodos a la vez. Si se omite, se usa `metodoPago`. */
  pagos?: PagoVenta[];
  tipo?: string;
  items: ItemVenta[];
  idempotencyKey?: string;
}

/**
 * Acceso a datos de ventas. La creación es transaccional y descuenta el stock
 * por lote en orden FIFO (lote más antiguo primero), registrando `lote_id` en
 * cada renglón del detalle. Bloquea la venta si no hay stock suficiente.
 */
@Injectable()
export class VentasRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async crear(tiendaId: string, userId: string, dto: CrearVentaInput) {
    return this.ds.transaction(async (m) => {
      // Idempotencia básica: si ya existe una venta con esa llave, la devuelve.
      // ponytail: check simple pre-transacción; el índice único es la garantía dura.
      if (dto.idempotencyKey) {
        const prev = await m.query(
          `SELECT id FROM venta WHERE tienda_id=$1 AND idempotency_key=$2 LIMIT 1;`,
          [tiendaId, dto.idempotencyKey],
        );
        if (prev.length) return this.detalle(tiendaId, prev[0].id, m);
      }

      const clienteId = dto.clienteId ?? (await this.clienteCF(tiendaId, m));
      const subtotal = +dto.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0).toFixed(2);

      // Pago mixto: normaliza a lista de pagos y valida que sumen el total.
      const pagos: PagoVenta[] = (dto.pagos && dto.pagos.length)
        ? dto.pagos
        : [{ metodoPago: dto.metodoPago ?? 'EFECTIVO', monto: subtotal }];
      const sumaPagos = +pagos.reduce((s, p) => s + Number(p.monto), 0).toFixed(2);
      if (Math.abs(sumaPagos - subtotal) > 0.01) {
        throw new BadRequestException(
          `Los pagos (Q${sumaPagos}) no cuadran con el total (Q${subtotal}).`,
        );
      }
      const metodoResumen = pagos.length > 1 ? 'MIXTO' : pagos[0].metodoPago;

      const ventaRows = await m.query(
        `INSERT INTO venta (tienda_id, cliente_id, usuario_id, numero_venta, subtotal,
                            descuento, total, metodo_pago, tipo, estado_despacho, idempotency_key, created_by)
         VALUES ($1,$2,$3, 'V-'||to_char(now(),'YYYYMMDD')||'-'||substr(md5(random()::text),1,6),
                 $4, 0, $4, $5, $6, 'PENDIENTE', $7, $3)
         RETURNING id;`,
        [tiendaId, clienteId, userId, subtotal, metodoResumen, dto.tipo ?? 'CONTADO', dto.idempotencyKey ?? null],
      );
      const ventaId = ventaRows[0].id;

      for (const p of pagos) {
        await m.query(
          `INSERT INTO venta_pago (tienda_id, venta_id, metodo_pago, monto, created_by)
           VALUES ($1,$2,$3,$4,$5);`,
          [tiendaId, ventaId, p.metodoPago, p.monto, userId],
        );
      }

      for (const item of dto.items) {
        await this.descontarFifo(tiendaId, userId, ventaId, item, m);
      }

      await auditar(m, {
        usuarioId: userId, tiendaId, accion: 'INSERT', tabla: 'venta',
        registroId: ventaId,
        datosNuevos: { total: subtotal, items: dto.items.length, metodoPago: dto.metodoPago ?? 'EFECTIVO' },
      });

      return this.detalle(tiendaId, ventaId, m);
    });
  }

  /** Descuenta `item.cantidad` de los lotes del producto en orden FIFO. */
  private async descontarFifo(
    tiendaId: string, userId: string, ventaId: string, item: ItemVenta, m: EntityManager,
  ) {
    const lotes = await m.query(
      `SELECT id, cantidad_disponible FROM lote
       WHERE producto_id=$1 AND tienda_id=$2 AND estado='ACTIVO' AND cantidad_disponible > 0
       ORDER BY fecha_ingreso ASC NULLS LAST, created_at ASC
       FOR UPDATE;`,
      [item.productoId, tiendaId],
    );
    const disponible = lotes.reduce((s: number, l: any) => s + l.cantidad_disponible, 0);
    if (disponible < item.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para el producto (disponible ${disponible}, solicitado ${item.cantidad}).`,
      );
    }

    let restante = item.cantidad;
    for (const lote of lotes) {
      if (restante <= 0) break;
      const usar = Math.min(restante, lote.cantidad_disponible);
      await m.query(
        `UPDATE lote SET cantidad_disponible = cantidad_disponible - $1, updated_by=$2 WHERE id=$3;`,
        [usar, userId, lote.id],
      );
      await m.query(
        `INSERT INTO detalle_venta (tienda_id, venta_id, producto_id, lote_id, cantidad, precio_unitario, subtotal, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`,
        [tiendaId, ventaId, item.productoId, lote.id, usar, item.precioUnitario, usar * item.precioUnitario, userId],
      );
      restante -= usar;
    }
  }

  private async clienteCF(tiendaId: string, m: EntityManager): Promise<string> {
    const rows = await m.query(
      `SELECT id FROM cliente WHERE tienda_id=$1 AND es_cf=true AND estado='ACTIVO' LIMIT 1;`,
      [tiendaId],
    );
    if (!rows.length) throw new BadRequestException('No hay cliente Consumidor Final configurado.');
    return rows[0].id;
  }

  /** Venta con su detalle (para recibo / consulta). */
  async detalle(tiendaId: string, ventaId: string, m: EntityManager | DataSource = this.ds) {
    const venta = (await m.query(
      `SELECT v.*, c.nombre AS cliente, u.nombre AS usuario
       FROM venta v
       LEFT JOIN cliente c ON c.id = v.cliente_id
       LEFT JOIN usuario u ON u.id = v.usuario_id
       WHERE v.tienda_id=$1 AND v.id=$2;`,
      [tiendaId, ventaId],
    ))[0];
    const items = await m.query(
      `SELECT dv.cantidad, dv.precio_unitario AS "precioUnitario", dv.subtotal, p.nombre AS producto
       FROM detalle_venta dv JOIN producto p ON p.id = dv.producto_id
       WHERE dv.tienda_id=$1 AND dv.venta_id=$2;`,
      [tiendaId, ventaId],
    );
    const pagos = await m.query(
      `SELECT metodo_pago AS "metodoPago", monto FROM venta_pago
       WHERE tienda_id=$1 AND venta_id=$2 ORDER BY created_at;`,
      [tiendaId, ventaId],
    );
    return { ...venta, items, pagos };
  }

  listar(tiendaId: string, estadoDespacho?: string) {
    const cond = estadoDespacho ? `AND v.estado_despacho = $2` : '';
    const params = estadoDespacho ? [tiendaId, estadoDespacho] : [tiendaId];
    return this.ds.query(
      `SELECT v.id, v.numero_venta AS "numeroVenta", v.fecha, v.total, v.metodo_pago AS "metodoPago",
              v.estado_despacho AS "estadoDespacho", c.nombre AS cliente, u.nombre AS usuario
       FROM venta v
       LEFT JOIN cliente c ON c.id = v.cliente_id
       LEFT JOIN usuario u ON u.id = v.usuario_id
       WHERE v.tienda_id=$1 AND v.estado <> 'ELIMINADO' ${cond}
       ORDER BY v.fecha DESC LIMIT 300;`,
      params,
    );
  }

  async marcarDespachado(tiendaId: string, userId: string, ventaId: string) {
    const res = await this.ds.query(
      `UPDATE venta SET estado_despacho='DESPACHADO', updated_by=$3
       WHERE tienda_id=$1 AND id=$2 AND estado_despacho='PENDIENTE' RETURNING id;`,
      [tiendaId, ventaId, userId],
    );
    if (res.length > 0) {
      await auditar(this.ds, {
        usuarioId: userId, tiendaId, accion: 'UPDATE', tabla: 'venta',
        registroId: ventaId, datosNuevos: { estadoDespacho: 'DESPACHADO' },
      });
    }
    return { id: ventaId, actualizado: res.length > 0 };
  }
}
