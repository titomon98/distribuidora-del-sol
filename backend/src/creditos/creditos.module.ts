import {
  BadRequestException, Body, Controller, Get, Injectable, Module, Param, Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';
import { auditar } from '../common/audit/audit.helper';

class AbonoDto {
  @IsNumber() @Min(0.01) monto: number;
}

@Injectable()
class CreditosService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  porCobrar(t: string) {
    return this.ds.query(
      `SELECT cc.id, cc.monto_total AS "montoTotal", cc.saldo, cc.fecha_vencimiento AS "fechaVencimiento",
              cl.nombre AS cliente, v.numero_venta AS "numeroVenta"
       FROM credito_cliente cc
       LEFT JOIN cliente cl ON cl.id = cc.cliente_id
       LEFT JOIN venta v ON v.id = cc.venta_id
       WHERE cc.tienda_id=$1 AND cc.estado='ACTIVO' AND cc.saldo > 0
       ORDER BY cc.fecha_vencimiento NULLS LAST, cc.created_at;`, [t]);
  }

  porPagar(t: string) {
    return this.ds.query(
      `SELECT cp.id, cp.monto_total AS "montoTotal", cp.saldo, cp.fecha_vencimiento AS "fechaVencimiento",
              pr.nombre AS proveedor, c.numero_compra AS "numeroCompra"
       FROM credito_proveedor cp
       LEFT JOIN proveedor pr ON pr.id = cp.proveedor_id
       LEFT JOIN compra c ON c.id = cp.compra_id
       WHERE cp.tienda_id=$1 AND cp.estado='ACTIVO' AND cp.saldo > 0
       ORDER BY cp.fecha_vencimiento NULLS LAST, cp.created_at;`, [t]);
  }

  private async abonar(tabla: string, t: string, userId: string, id: string, monto: number) {
    return this.ds.transaction(async (m) => {
      const row = (await m.query(
        `SELECT id, saldo FROM ${tabla} WHERE tienda_id=$1 AND id=$2 FOR UPDATE;`, [t, id],
      ))[0];
      if (!row) throw new BadRequestException('Crédito no encontrado');
      const saldo = Number(row.saldo);
      if (monto > saldo + 0.01) throw new BadRequestException(`El abono (Q${monto}) supera el saldo (Q${saldo}).`);
      const nuevo = +(saldo - monto).toFixed(2);
      const estadoNuevo = nuevo <= 0 ? 'PAGADO' : 'ACTIVO';
      await m.query(
        `UPDATE ${tabla} SET saldo=$1, estado=$2, updated_by=$3 WHERE id=$4;`,
        [nuevo, estadoNuevo, userId, id],
      );
      await auditar(m, {
        usuarioId: userId, tiendaId: t, accion: 'UPDATE', tabla,
        registroId: id, datosNuevos: { abono: monto, saldo: nuevo },
      });
      return { id, saldo: nuevo, pagado: nuevo <= 0 };
    });
  }

  abonarCobrar(t: string, u: string, id: string, monto: number) { return this.abonar('credito_cliente', t, u, id, monto); }
  abonarPagar(t: string, u: string, id: string, monto: number) { return this.abonar('credito_proveedor', t, u, id, monto); }
}

@UseGuards(JwtAuthGuard)
@Controller('creditos')
class CreditosController {
  constructor(private readonly s: CreditosService) {}

  @Get('por-cobrar') porCobrar(@Req() r: Request) { return this.s.porCobrar(reqUser(r).tiendaId); }
  @Get('por-pagar') porPagar(@Req() r: Request) { return this.s.porPagar(reqUser(r).tiendaId); }

  @Post('por-cobrar/:id/abono')
  abonoCobrar(@Param('id') id: string, @Body() dto: AbonoDto, @Req() r: Request) {
    const u = reqUser(r); return this.s.abonarCobrar(u.tiendaId, u.sub, id, dto.monto);
  }
  @Post('por-pagar/:id/abono')
  abonoPagar(@Param('id') id: string, @Body() dto: AbonoDto, @Req() r: Request) {
    const u = reqUser(r); return this.s.abonarPagar(u.tiendaId, u.sub, id, dto.monto);
  }
}

@Module({
  imports: [TypeOrmModule],
  controllers: [CreditosController],
  providers: [CreditosService, JwtAuthGuard],
})
export class CreditosModule {}
