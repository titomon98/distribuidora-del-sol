import {
  Body, Controller, ForbiddenException, Get, Headers, Param, Patch, Post, Query, Req, UseGuards, Module,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';
import { VentasService } from './ventas.service';
import { VentasRepository } from './ventas.repository';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { RealtimeModule } from '../realtime/realtime.module';

@UseGuards(JwtAuthGuard)
@Controller('ventas')
class VentasController {
  constructor(private readonly service: VentasService) {}

  @Post()
  crear(
    @Body() dto: CrearVentaDto,
    @Headers('idempotency-key') idem: string,
    @Req() req: Request,
  ) {
    const u = reqUser(req);
    return this.service.crear(u.tiendaId, u.sub, { ...dto, idempotencyKey: idem });
  }

  @Get()
  listar(@Query('estadoDespacho') estado: string, @Req() req: Request) {
    return this.service.listar(reqUser(req).tiendaId, estado);
  }

  @Get(':id')
  detalle(@Param('id') id: string, @Req() req: Request) {
    return this.service.detalle(reqUser(req).tiendaId, id);
  }

  @Patch(':id/fecha')
  cambiarFecha(@Param('id') id: string, @Body('fecha') fecha: string, @Req() req: Request) {
    const u = reqUser(req);
    if (u.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Solo el administrador puede cambiar la fecha de una venta.');
    }
    return this.service.cambiarFecha(u.tiendaId, u.sub, id, fecha);
  }

  @Patch(':id/despachar')
  despachar(@Param('id') id: string, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.despachar(u.tiendaId, u.sub, id);
  }

  @Patch(':id/anular')
  anular(@Param('id') id: string, @Req() req: Request) {
    const u = reqUser(req);
    if (u.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Solo el administrador puede anular ventas.');
    }
    return this.service.anular(u.tiendaId, u.sub, id);
  }
}

@Module({
  imports: [RealtimeModule],
  controllers: [VentasController],
  providers: [VentasService, VentasRepository, JwtAuthGuard],
})
export class VentasModule {}
