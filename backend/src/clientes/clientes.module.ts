import { Body, Controller, Module, Patch, Post, Param, Req } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Cliente } from '../entities/cliente.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController, reqUser } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ClienteDto {
  @IsString() @MinLength(1) @MaxLength(150) nombre: string;
  @IsOptional() @IsString() @MaxLength(30) nit?: string;
  @IsOptional() @IsString() @MaxLength(30) telefono?: string;
  @IsOptional() @IsString() @MaxLength(255) direccion?: string;
  @IsOptional() @IsString() @MaxLength(150) email?: string;
}

class ClientesService extends CrudService<Cliente> {
  constructor(@InjectRepository(Cliente) repo: Repository<Cliente>) {
    super(repo, 'Cliente');
  }
}

@Controller('clientes')
class ClientesController extends CrudController {
  constructor(protected readonly service: ClientesService) {
    super();
  }

  @Post()
  create(@Body() dto: ClienteDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.create(u.tiendaId, u.sub, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: ClienteDto, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.update(u.tiendaId, u.sub, id, dto);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesController],
  providers: [ClientesService, JwtAuthGuard],
})
export class ClientesModule {}
