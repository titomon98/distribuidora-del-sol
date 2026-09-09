import { Injectable } from '@nestjs/common';
import { CrearVentaInput, VentasRepository } from './ventas.repository';
import { EventsGateway } from '../realtime/events.gateway';

@Injectable()
export class VentasService {
  constructor(
    private readonly repo: VentasRepository,
    private readonly events: EventsGateway,
  ) {}

  async crear(tiendaId: string, userId: string, dto: CrearVentaInput) {
    const venta = await this.repo.crear(tiendaId, userId, dto);
    // Avisa a la estación de despacho en tiempo real.
    this.events.ventaNueva(tiendaId, {
      id: venta.id,
      numeroVenta: venta.numero_venta,
      total: venta.total,
      cliente: venta.cliente,
      fecha: venta.fecha,
      estadoDespacho: venta.estado_despacho,
    });
    return venta;
  }
  listar(tiendaId: string, estadoDespacho?: string) {
    return this.repo.listar(tiendaId, estadoDespacho);
  }
  detalle(tiendaId: string, id: string) {
    return this.repo.detalle(tiendaId, id);
  }
  async despachar(tiendaId: string, userId: string, id: string) {
    const res = await this.repo.marcarDespachado(tiendaId, userId, id);
    if (res.actualizado) this.events.ventaDespachada(tiendaId, { id });
    return res;
  }
  async anular(tiendaId: string, userId: string, id: string) {
    const res = await this.repo.anular(tiendaId, userId, id);
    // Refresca despacho/dashboard (la venta anulada sale de las listas).
    this.events.ventaDespachada(tiendaId, { id });
    return res;
  }
}
