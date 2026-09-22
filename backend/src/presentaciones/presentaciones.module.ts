import { Body, Controller, Module, Patch, Post, Param, Req } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Presentacion } from '../entities/presentacion.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class PresentacionDto {
  @IsString() @MinLength(1) @MaxLength(120)
  nombre: string;

  @IsOptional() @IsString() @MaxLength(255)
  descripcion?: string;
}

class PresentacionesService extends CrudService<Presentacion> {
  constructor(@InjectRepository(Presentacion) repo: Repository<Presentacion>) {
    super(repo, 'Presentación');
  }
}

@Controller('presentaciones')
class PresentacionesController extends CrudController {
  constructor(protected readonly service: PresentacionesService) {
    super();
  }

  @Post()
  create(@Body() dto: PresentacionDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: PresentacionDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Presentacion])],
  controllers: [PresentacionesController],
  providers: [PresentacionesService, JwtAuthGuard],
})
export class PresentacionesModule {}
