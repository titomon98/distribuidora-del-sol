import { NotFoundException } from '@nestjs/common';
import { Repository, ObjectLiteral, Not, ILike } from 'typeorm';

/**
 * Servicio CRUD genérico para entidades de dominio (tienda-scoped).
 *
 * - Filtra por `tienda_id` (multi-sucursal) en toda operación.
 * - Borrado lógico: `estado = 'ELIMINADO'` (nunca DELETE físico; es contable).
 * - Rellena `created_by` / `updated_by` con el usuario del token.
 *
 * Cada módulo (marcas, productos, …) extiende esta clase pasando su Repository.
 * La validación del cuerpo vive en el DTO de cada controlador (class-validator).
 */
export abstract class CrudService<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repo: Repository<T>,
    protected readonly nombreEntidad: string,
  ) {}

  list(tiendaId: string, search?: string): Promise<T[]> {
    const where: any = { tiendaId, estado: Not('ELIMINADO') };
    if (search) where.nombre = ILike(`%${search}%`);
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' } as any,
      take: search ? 50 : 500,
    });
  }

  async get(tiendaId: string, id: string): Promise<T> {
    const row = await this.repo.findOne({ where: { id, tiendaId } as any });
    if (!row || (row as any).estado === 'ELIMINADO') {
      throw new NotFoundException(`${this.nombreEntidad} no encontrado`);
    }
    return row;
  }

  create(tiendaId: string, userId: string, data: Record<string, any>): Promise<T> {
    const entity = this.repo.create({
      ...data,
      tiendaId,
      createdBy: userId,
      updatedBy: userId,
    } as any);
    return this.repo.save(entity as any);
  }

  async update(tiendaId: string, userId: string, id: string, data: Record<string, any>): Promise<T> {
    const row = await this.get(tiendaId, id);
    this.repo.merge(row, { ...data, updatedBy: userId } as any);
    return this.repo.save(row as any);
  }

  async remove(tiendaId: string, userId: string, id: string): Promise<{ id: string }> {
    const row = await this.get(tiendaId, id);
    this.repo.merge(row, { estado: 'ELIMINADO', updatedBy: userId } as any);
    await this.repo.save(row as any);
    return { id };
  }
}
