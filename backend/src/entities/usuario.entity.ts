import { Entity, Column, Index } from 'typeorm';
import { BaseTiendaEntity } from '../common/entities/base-tienda.entity';

/** Usuario: datos de los usuarios del sistema. */
@Entity({ name: 'usuario' })
export class Usuario extends BaseTiendaEntity {
  @Column({ type: 'uuid', name: 'rol_id' })
  rolId: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Index('ux_usuario_username', { unique: true })
  @Column({ type: 'varchar', length: 60 })
  username: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;
}
