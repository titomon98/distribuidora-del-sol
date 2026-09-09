import { Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/auth.service';
import { CrudService } from './crud.service';

/** Usuario del token (tiendaId + sub). */
export const reqUser = (req: Request) =>
  (req as Request & { user: JwtPayload }).user;

/**
 * Controlador CRUD genérico: aporta list / get / remove.
 *
 * `create` y `update` NO van aquí a propósito: el ValidationPipe global sólo
 * valida/whitelistea si el parámetro `@Body()` tiene el tipo del DTO concreto,
 * y al heredarse el tipo se borra (quedaría un agujero de mass-assignment). Por
 * eso cada recurso declara sus propios `create`/`update` con su DTO tipado.
 */
@UseGuards(JwtAuthGuard)
export abstract class CrudController {
  protected abstract readonly service: CrudService<any>;

  @Get()
  list(@Req() req: Request, @Query('search') search?: string) {
    return this.service.list(reqUser(req).tiendaId, search);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: Request) {
    return this.service.get(reqUser(req).tiendaId, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const u = reqUser(req);
    return this.service.remove(u.tiendaId, u.sub, id);
  }
}
