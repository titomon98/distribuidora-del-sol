import { Controller, Get, Injectable, Module, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';

@Injectable()
class CierreCajaService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async resumen(tiendaId: string, fecha?: string) {
    // fecha = 'YYYY-MM-DD'; por defecto hoy.
    const dia = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null;
    // Filtros por día para venta (v.fecha) y abono (a.fecha).
    const filtro = (col: string) => dia
      ? `${col} >= $2::date AND ${col} < ($2::date + interval '1 day')`
      : `${col} >= date_trunc('day', now()) AND ${col} < date_trunc('day', now()) + interval '1 day'`;
    const params = dia ? [tiendaId, dia] : [tiendaId];

    // Número de ventas del día (informativo).
    const totales = (await this.ds.query(
      `SELECT COUNT(*)::int AS cantidad
       FROM venta v WHERE v.tienda_id=$1 AND v.estado='ACTIVO' AND ${filtro('v.fecha')};`,
      params,
    ))[0];

    // Dinero recibido al momento de cada venta del día, por método.
    const pagosVenta = await this.ds.query(
      `SELECT vp.metodo_pago AS "metodoPago", COALESCE(SUM(vp.monto),0)::numeric AS total, COUNT(*)::int AS cantidad
       FROM venta_pago vp JOIN venta v ON v.id = vp.venta_id
       WHERE v.tienda_id=$1 AND v.estado='ACTIVO' AND ${filtro('v.fecha')}
       GROUP BY vp.metodo_pago;`,
      params,
    );

    // Abonos a créditos de clientes cobrados ese día, por método.
    const abonosDia = await this.ds.query(
      `SELECT a.metodo_pago AS "metodoPago", COALESCE(SUM(a.monto),0)::numeric AS total, COUNT(*)::int AS cantidad
       FROM abono a
       WHERE a.tienda_id=$1 AND a.estado='ACTIVO' AND ${filtro('a.fecha')}
       GROUP BY a.metodo_pago;`,
      params,
    );

    // Combina pagos de venta + abonos por método = dinero recibido en el día.
    const mapa: Record<string, { metodoPago: string; total: number; cantidad: number }> = {};
    const sumar = (rows: any[]) => rows.forEach((r) => {
      const k = r.metodoPago || 'EFECTIVO';
      if (!mapa[k]) mapa[k] = { metodoPago: k, total: 0, cantidad: 0 };
      mapa[k].total += Number(r.total);
      mapa[k].cantidad += Number(r.cantidad);
    });
    sumar(pagosVenta);
    sumar(abonosDia);

    const porMetodo = Object.values(mapa).sort((a, b) => b.total - a.total);
    const total = porMetodo.reduce((s, r) => s + r.total, 0);
    const abonos = abonosDia.reduce((s: number, r: any) => s + Number(r.total), 0);

    return {
      fecha: dia ?? new Date().toISOString().slice(0, 10),
      total: +total.toFixed(2),
      cantidad: totales.cantidad,
      abonos: +abonos.toFixed(2),
      porMetodo,
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('cierre-caja')
class CierreCajaController {
  constructor(private readonly service: CierreCajaService) {}

  @Get()
  resumen(@Query('fecha') fecha: string, @Req() req: Request) {
    return this.service.resumen(reqUser(req).tiendaId, fecha);
  }
}

@Module({
  imports: [TypeOrmModule],
  controllers: [CierreCajaController],
  providers: [CierreCajaService, JwtAuthGuard],
})
export class CierreCajaModule {}
