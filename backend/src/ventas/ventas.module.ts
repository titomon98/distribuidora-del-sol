import {
  Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards, Module,
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

  @Patch(':id/despachar')
  despachar(@Param('id') id: string, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.despachar(u.tiendaId, u.sub, id);
  }
}

@Module({
  imports: [RealtimeModule],
  controllers: [VentasController],
  providers: [VentasService, VentasRepository, JwtAuthGuard],
})
export class VentasModule {}
