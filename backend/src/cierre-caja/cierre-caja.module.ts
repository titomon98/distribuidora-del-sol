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
    const filtroFecha = dia
      ? `v.fecha >= $2::date AND v.fecha < ($2::date + interval '1 day')`
      : `v.fecha >= date_trunc('day', now()) AND v.fecha < date_trunc('day', now()) + interval '1 day'`;
    const params = dia ? [tiendaId, dia] : [tiendaId];

    const totales = (await this.ds.query(
      `SELECT COALESCE(SUM(v.total),0)::numeric AS total, COUNT(*)::int AS cantidad
       FROM venta v WHERE v.tienda_id=$1 AND v.estado='ACTIVO' AND ${filtroFecha};`,
      params,
    ))[0];

    const porMetodo = await this.ds.query(
      `SELECT v.metodo_pago AS "metodoPago", COALESCE(SUM(v.total),0)::numeric AS total, COUNT(*)::int AS cantidad
       FROM venta v WHERE v.tienda_id=$1 AND v.estado='ACTIVO' AND ${filtroFecha}
       GROUP BY v.metodo_pago ORDER BY total DESC;`,
      params,
    );

    return {
      fecha: dia ?? new Date().toISOString().slice(0, 10),
      total: Number(totales.total),
      cantidad: totales.cantidad,
      porMetodo: porMetodo.map((r: any) => ({ ...r, total: Number(r.total) })),
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
