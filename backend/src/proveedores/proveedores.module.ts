import { Body, Controller, Injectable, Module, Param, Patch, Post, Req } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Proveedor } from '../entities/proveedor.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ProveedorDto {
  @IsString() @MinLength(1) @MaxLength(150)
  nombre: string;

  @IsOptional() @IsString() @MaxLength(30)
  nit?: string;

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string;

  @IsOptional() @IsString() @MaxLength(255)
  direccion?: string;

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string;
}

@Injectable()
class ProveedoresService extends CrudService<Proveedor> {
  constructor(@InjectRepository(Proveedor) repo: Repository<Proveedor>) {
    super(repo, 'Proveedor');
  }
}

@Controller('proveedores')
class ProveedoresController extends CrudController {
  constructor(protected readonly service: ProveedoresService) {
    super();
  }

  @Post()
  create(@Body() dto: ProveedorDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: ProveedorDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, JwtAuthGuard],
})
export class ProveedoresModule {}
