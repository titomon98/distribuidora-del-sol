import { Controller, Injectable, Module } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../entities/proveedor.entity';
import { CrudService } from '../common/crud/crud.service';
import { CrudController } from '../common/crud/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Solo lectura (list/get) — sirve para el selector de proveedores al comprar.
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
}

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, JwtAuthGuard],
})
export class ProveedoresModule {}
