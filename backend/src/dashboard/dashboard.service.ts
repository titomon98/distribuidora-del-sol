import { Injectable } from '@nestjs/common';
import { DashboardRepository, ProductoVendido } from './dashboard.repository';

export interface ResumenDashboard {
  ventasHoy: { total: number; cantidad: number };
  despachadasHoy: number;
  pendientesHoy: number;
  productosMasVendidos: ProductoVendido[];
  alertasStock: { bajo: number; agotado: number };
}

/** Capa de negocio del dashboard. */
@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async resumen(tiendaId: string): Promise<ResumenDashboard> {
    const [ventasHoy, despachadasHoy, pendientesHoy, productosMasVendidos, alertasStock] =
      await Promise.all([
        this.repo.ventasHoy(tiendaId),
        this.repo.despachoHoy(tiendaId, 'DESPACHADO'),
        this.repo.despachoHoy(tiendaId, 'PENDIENTE'),
        this.repo.productosMasVendidos(tiendaId),
        this.repo.alertasStock(tiendaId),
      ]);
    return { ventasHoy, despachadasHoy, pendientesHoy, productosMasVendidos, alertasStock };
  }
}
