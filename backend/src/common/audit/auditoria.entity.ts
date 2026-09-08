import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Bitácora de auditoría (append-only).
 *
 * Registra QUIÉN realizó QUÉ acción en QUÉ tabla y sobre QUÉ registro,
 * guardando además los datos antes y después del cambio.
 *
 * No hereda de BaseEntity: no tiene `estado` ni `updated_at` porque una
 * bitácora nunca se modifica, solo se agregan filas.
 */
@Entity({ name: 'auditoria' })
@Index('ix_auditoria_tabla_registro', ['tabla', 'registroId'])
@Index('ix_auditoria_usuario', ['usuarioId'])
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'usuario_id', nullable: true })
  usuarioId?: string | null;

  @Column({ type: 'uuid', name: 'tienda_id', nullable: true })
  tiendaId?: string | null;

  // INSERT | UPDATE | DELETE (u otras acciones de negocio)
  @Column({ type: 'varchar', length: 20 })
  accion: string;

  @Column({ type: 'varchar', length: 60 })
  tabla: string;

  @Column({ type: 'uuid', name: 'registro_id', nullable: true })
  registroId?: string | null;

  @Column({ type: 'jsonb', name: 'datos_anteriores', nullable: true })
  datosAnteriores?: unknown | null;

  @Column({ type: 'jsonb', name: 'datos_nuevos', nullable: true })
  datosNuevos?: unknown | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  ip?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
