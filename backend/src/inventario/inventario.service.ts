import { Injectable } from '@nestjs/common';
import { InventarioRepository } from './inventario.repository';

@Injectable()
export class InventarioService {
  constructor(private readonly repo: InventarioRepository) {}

  async existencias(tiendaId: string) {
    const rows = await this.repo.existencias(tiendaId);
    return rows.map((r) => ({
      ...r,
      alerta:
        r.stock <= 0 ? 'AGOTADO' : r.stock <= r.stockMinimo ? 'BAJO' : 'OK',
    }));
  }

  movimientos(tiendaId: string) {
    return this.repo.movimientos(tiendaId);
  }

  lotes(tiendaId: string, productoId: string) {
    return this.repo.lotesDeProducto(tiendaId, productoId);
  }
}
