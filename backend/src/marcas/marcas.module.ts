import { Body, Controller, Module, Patch, Post, Param, Req } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Marca } from '../entities/marca.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class MarcaDto {
  @IsString() @MinLength(1) @MaxLength(120)
  nombre: string;

  @IsOptional() @IsString() @MaxLength(255)
  descripcion?: string;
}

class MarcasService extends CrudService<Marca> {
  constructor(@InjectRepository(Marca) repo: Repository<Marca>) {
    super(repo, 'Marca');
  }
}

@Controller('marcas')
class MarcasController extends CrudController {
  constructor(protected readonly service: MarcasService) {
    super();
  }

  @Post()
  create(@Body() dto: MarcaDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: MarcaDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Marca])],
  controllers: [MarcasController],
  providers: [MarcasService, JwtAuthGuard],
})
export class MarcasModule {}
