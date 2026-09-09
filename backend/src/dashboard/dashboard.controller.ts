import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';
import { DashboardService } from './dashboard.service';

/** Capa de presentación del dashboard. */
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('resumen')
  resumen(@Req() req: Request) {
    const { tiendaId } = (req as Request & { user: JwtPayload }).user;
    return this.dashboard.resumen(tiendaId);
  }
}
