import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Registro de claves de idempotencia.
 *
 * La app puede recibir varios clicks al mismo botón (doble envío del mismo
 * pedido, venta, compra, etc.). El cliente manda una cabecera
 * `Idempotency-Key`; la primera petición se procesa y su respuesta se guarda
 * aquí. Cualquier repetición con la misma clave devuelve la respuesta ya
 * almacenada en lugar de ejecutar la operación otra vez.
 *
 * El índice ÚNICO sobre `clave` es la garantía real a nivel de base de datos:
 * dos requests concurrentes con la misma clave no pueden insertar dos filas.
 */
@Entity({ name: 'idempotency_key' })
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('ux_idempotency_clave', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  clave: string;

  @Column({ type: 'uuid', name: 'usuario_id', nullable: true })
  usuarioId?: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  metodo?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint?: string | null;

  @Column({ type: 'varchar', length: 128, name: 'request_hash', nullable: true })
  requestHash?: string | null;

  @Column({ type: 'int', name: 'response_status', nullable: true })
  responseStatus?: number | null;

  @Column({ type: 'jsonb', name: 'response_body', nullable: true })
  responseBody?: unknown | null;

  // EN_PROCESO | COMPLETADO | ERROR
  @Column({ type: 'varchar', length: 20, default: 'EN_PROCESO' })
  estado: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt?: Date | null;
}
