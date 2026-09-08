import { Entity, Column } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** Proveedor: proveedores a los que se les compra la mercancía. */
@Entity({ name: 'proveedor' })
export class Proveedor extends BaseTiendaEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nit?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string | null;
}
