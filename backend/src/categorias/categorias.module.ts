import { Body, Controller, Module, Patch, Post, Param, Req } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TipoProducto } from '../entities/tipo-producto.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CategoriaDto {
  @IsString() @MinLength(1) @MaxLength(120)
  nombre: string;

  @IsOptional() @IsString() @MaxLength(255)
  descripcion?: string;
}

class CategoriasService extends CrudService<TipoProducto> {
  constructor(@InjectRepository(TipoProducto) repo: Repository<TipoProducto>) {
    super(repo, 'Categoría');
  }
}

@Controller('categorias')
class CategoriasController extends CrudController {
  constructor(protected readonly service: CategoriasService) {
    super();
  }

  @Post()
  create(@Body() dto: CategoriaDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CategoriaDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([TipoProducto])],
  controllers: [CategoriasController],
  providers: [CategoriasService, JwtAuthGuard],
})
export class CategoriasModule {}
