import { Controller, Get, Param, Req, UseGuards, Module } from '@nestjs/common';
import { Request } from 'express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../entities/producto.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';
import { InventarioService } from './inventario.service';
import { InventarioRepository } from './inventario.repository';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
class InventarioController {
  constructor(private readonly service: InventarioService) {}

  @Get()
  existencias(@Req() req: Request) {
    return this.service.existencias(reqUser(req).tiendaId);
  }

  @Get('movimientos')
  movimientos(@Req() req: Request) {
    return this.service.movimientos(reqUser(req).tiendaId);
  }

  @Get(':productoId/lotes')
  lotes(@Param('productoId') productoId: string, @Req() req: Request) {
    return this.service.lotes(reqUser(req).tiendaId, productoId);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [InventarioController],
  providers: [InventarioService, InventarioRepository, JwtAuthGuard],
})
export class InventarioModule {}
