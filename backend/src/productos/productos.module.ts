import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../entities/producto.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductosController],
  providers: [ProductosService, JwtAuthGuard],
})
export class ProductosModule {}
