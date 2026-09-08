import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Columnas comunes a TODAS las tablas de dominio:
 *  - id UUID
 *  - estado (varchar; a futuro cada tabla enumera >2 estados propios)
 *  - timestamps (created_at / updated_at)
 *  - created_by / updated_by: qué usuario creó/modificó el registro
 *    (la bitácora completa vive en la tabla `auditoria`).
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, default: 'ACTIVO' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string | null;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string | null;
}
