import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

/** Rol: roles de los usuarios del sistema (ej. ADMINISTRADOR, CAJERO, DESPACHADOR). */
@Entity({ name: 'rol' })
export class Rol extends BaseEntity {
  @Index('ux_rol_nombre', { unique: true })
  @Column({ type: 'varchar', length: 60 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion?: string | null;
}
