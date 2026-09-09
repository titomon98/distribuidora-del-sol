import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { ProductosService } from './productos.service';
import { ProductoDto } from './dto/producto.dto';

/** Capa de presentación de productos (CRUD + lectura por código de barras). */
@Controller('productos')
export class ProductosController extends CrudController {
  constructor(protected readonly service: ProductosService) {
    super();
  }

  // Sobrescribe el list base para incluir el conteo de lotes + stock.
  @Get()
  list(@Req() req: Request, @Query('search') search?: string) {
    return this.service.listarConLotes(reqUser(req).tiendaId, search);
  }

  /** Lectura por código de barras (pistola/escáner del punto de cobro). */
  @Get('barcode/:codigo')
  porCodigo(@Param('codigo') codigo: string, @Req() req: Request) {
    return this.service.getByBarcode(reqUser(req).tiendaId, codigo);
  }

  @Post()
  create(@Body() dto: ProductoDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: ProductoDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}
