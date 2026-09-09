import { Injectable } from '@nestjs/common';
import { DashboardRepository, ProductoVendido } from './dashboard.repository';

export interface ResumenDashboard {
  ventasHoy: { total: number; cantidad: number };
  despachadasHoy: number;
  pendientesHoy: number;
  productosMasVendidos: ProductoVendido[];
}

/** Capa de negocio del dashboard. */
@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async resumen(tiendaId: string): Promise<ResumenDashboard> {
    const [ventasHoy, despachadasHoy, pendientesHoy, productosMasVendidos] =
      await Promise.all([
        this.repo.ventasHoy(tiendaId),
        this.repo.despachoHoy(tiendaId, 'DESPACHADO'),
        this.repo.despachoHoy(tiendaId, 'PENDIENTE'),
        this.repo.productosMasVendidos(tiendaId),
      ]);
    return { ventasHoy, despachadasHoy, pendientesHoy, productosMasVendidos };
  }
}
