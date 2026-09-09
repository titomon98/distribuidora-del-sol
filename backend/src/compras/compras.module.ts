import {
  Body, Controller, Get, Headers, Injectable, Module, Param, Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';
import { ComprasRepository, CrearCompraInput } from './compras.repository';

class ItemCompraDto {
  @IsUUID() productoId: string;
  @IsInt() @Min(1) cantidad: number;
  @IsNumber() @Min(0) costoUnitario: number;
}
class CrearCompraDto {
  @IsString() proveedorId: string;
  @IsOptional() @IsString() tipoPago?: string;
  @IsOptional() @IsNumber() @Min(0) montoPagado?: number;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemCompraDto)
  items: ItemCompraDto[];
}

@Injectable()
class ComprasService {
  constructor(private readonly repo: ComprasRepository) {}
  crear(t: string, u: string, dto: CrearCompraInput) { return this.repo.crear(t, u, dto); }
  listar(t: string) { return this.repo.listar(t); }
  detalle(t: string, id: string) { return this.repo.detalle(t, id); }
}

@UseGuards(JwtAuthGuard)
@Controller('compras')
class ComprasController {
  constructor(private readonly service: ComprasService) {}

  @Post()
  crear(@Body() dto: CrearCompraDto, @Headers('idempotency-key') idem: string, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.crear(u.tiendaId, u.sub, { ...dto, idempotencyKey: idem });
  }

  @Get()
  listar(@Req() req: Request) { return this.service.listar(reqUser(req).tiendaId); }

  @Get(':id')
  detalle(@Param('id') id: string, @Req() req: Request) {
    return this.service.detalle(reqUser(req).tiendaId, id);
  }
}

@Module({
  controllers: [ComprasController],
  providers: [ComprasService, ComprasRepository, JwtAuthGuard],
})
export class ComprasModule {}
