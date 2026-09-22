import { Controller, Get, Injectable, Module, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';

@Injectable()
class ReportesService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  ventas(t: string, desde?: string, hasta?: string) {
    return this.ds.query(
      `SELECT v.numero_venta AS "numeroVenta", v.fecha, v.total, v.metodo_pago AS "metodoPago",
              v.estado_despacho AS "estadoDespacho", c.nombre AS cliente, u.nombre AS usuario
       FROM venta v
       LEFT JOIN cliente c ON c.id=v.cliente_id
       LEFT JOIN usuario u ON u.id=v.usuario_id
       WHERE v.tienda_id=$1 AND v.estado='ACTIVO'
         AND ($2::date IS NULL OR v.fecha >= $2::date)
         AND ($3::date IS NULL OR v.fecha < ($3::date + interval '1 day'))
       ORDER BY v.fecha DESC LIMIT 1000;`, [t, desde || null, hasta || null]);
  }

  compras(t: string, desde?: string, hasta?: string) {
    return this.ds.query(
      `SELECT c.numero_compra AS "numeroCompra", c.fecha, c.total, c.tipo_pago AS "tipoPago",
              pr.nombre AS proveedor, u.nombre AS usuario
       FROM compra c
       LEFT JOIN proveedor pr ON pr.id=c.proveedor_id
       LEFT JOIN usuario u ON u.id=c.usuario_id
       WHERE c.tienda_id=$1 AND c.estado<>'ELIMINADO'
         AND ($2::date IS NULL OR c.fecha >= $2::date)
         AND ($3::date IS NULL OR c.fecha < ($3::date + interval '1 day'))
       ORDER BY c.fecha DESC LIMIT 1000;`, [t, desde || null, hasta || null]);
  }

  productos(t: string) {
    return this.ds.query(
      `SELECT p.nombre, p.codigo_barras AS "codigoBarras", p.precio_venta AS "precioVenta",
              m.nombre AS marca, tp.nombre AS categoria,
              COALESCE(SUM(l.cantidad_disponible),0)::int AS stock,
              COALESCE((SELECT SUM(dv.cantidad) FROM detalle_venta dv WHERE dv.producto_id=p.id AND dv.estado<>'ELIMINADO'),0)::int AS vendidos
       FROM producto p
       LEFT JOIN lote l ON l.producto_id=p.id AND l.estado='ACTIVO'
       LEFT JOIN marca m ON m.id=p.marca_id
       LEFT JOIN tipo_producto tp ON tp.id=p.tipo_producto_id
       WHERE p.tienda_id=$1 AND p.estado<>'ELIMINADO'
       GROUP BY p.id, m.nombre, tp.nombre ORDER BY vendidos DESC;`, [t]);
  }

  usuarios(t: string, desde?: string, hasta?: string) {
    return this.ds.query(
      `SELECT a.created_at AS fecha, a.accion, a.tabla, u.nombre AS usuario
       FROM auditoria a
       LEFT JOIN usuario u ON u.id=a.usuario_id
       WHERE a.tienda_id=$1
         AND ($2::date IS NULL OR a.created_at >= $2::date)
         AND ($3::date IS NULL OR a.created_at < ($3::date + interval '1 day'))
       ORDER BY a.created_at DESC LIMIT 1000;`, [t, desde || null, hasta || null]);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('reportes')
class ReportesController {
  constructor(private readonly s: ReportesService) {}
  @Get('ventas') ventas(@Req() r: Request, @Query('desde') d: string, @Query('hasta') h: string) {
    return this.s.ventas(reqUser(r).tiendaId, d, h);
  }
  @Get('compras') compras(@Req() r: Request, @Query('desde') d: string, @Query('hasta') h: string) {
    return this.s.compras(reqUser(r).tiendaId, d, h);
  }
  @Get('productos') productos(@Req() r: Request) { return this.s.productos(reqUser(r).tiendaId); }
  @Get('usuarios') usuarios(@Req() r: Request, @Query('desde') d: string, @Query('hasta') h: string) {
    return this.s.usuarios(reqUser(r).tiendaId, d, h);
  }
}

@Module({
  imports: [TypeOrmModule],
  controllers: [ReportesController],
  providers: [ReportesService, JwtAuthGuard],
})
export class ReportesModule {}
