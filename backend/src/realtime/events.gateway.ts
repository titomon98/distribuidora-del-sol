import {
  ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Canal en tiempo real cobro ↔ despacho.
 *
 * Cada estación (caja / despacho) se conecta por Socket.IO y se une a la sala
 * de su tienda (`tienda:<id>`) para respetar el modelo multi-sucursal: los
 * eventos de una tienda no llegan a otra.
 *
 * Eventos emitidos:
 *  - `venta:nueva`      → hay un pedido nuevo pendiente de despacho.
 *  - `venta:despachada` → un pedido pasó a DESPACHADO.
 */
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' },
})
export class EventsGateway {
  @WebSocketServer() server: Server;

  /** El cliente pide unirse a la sala de su tienda. */
  @SubscribeMessage('join')
  join(@MessageBody() tiendaId: string, @ConnectedSocket() client: Socket) {
    if (tiendaId) client.join(`tienda:${tiendaId}`);
    return { ok: true };
  }

  ventaNueva(tiendaId: string, venta: unknown) {
    this.server?.to(`tienda:${tiendaId}`).emit('venta:nueva', venta);
  }

  ventaDespachada(tiendaId: string, payload: unknown) {
    this.server?.to(`tienda:${tiendaId}`).emit('venta:despachada', payload);
  }
}
