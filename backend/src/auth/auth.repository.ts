import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';

/** Usuario junto al nombre de su rol (proyección para login/perfil). */
export interface UsuarioConRol extends Usuario {
  rolNombre: string;
}

/**
 * Capa de acceso a datos del módulo de autenticación.
 * Aísla las consultas TypeORM del servicio (capa de negocio).
 */
@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
  ) {}

  /** Busca un usuario ACTIVO por username o email, con el nombre de su rol. */
  async findByLogin(identifier: string): Promise<UsuarioConRol | null> {
    const row = await this.usuarios
      .createQueryBuilder('u')
      .innerJoin(Rol, 'r', 'r.id = u.rol_id')
      .addSelect('r.nombre', 'u_rolNombre')
      .where('u.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('(u.username = :id OR u.email = :id)', { id: identifier })
      .getRawAndEntities();

    const usuario = row.entities[0];
    if (!usuario) return null;
    return Object.assign(usuario, { rolNombre: row.raw[0].u_rolNombre });
  }
}
