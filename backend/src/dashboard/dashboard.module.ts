import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from '../entities/venta.entity';
import { DetalleVenta } from '../entities/detalle-venta.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta])],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, JwtAuthGuard],
})
export class DashboardModule {}
