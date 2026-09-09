import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

/** Payload firmado dentro del JWT. */
export interface JwtPayload {
  sub: string; // usuario id
  username: string;
  rol: string;
  tiendaId: string;
}

/** Respuesta de login. Mantiene idToken/expiresIn para el frontend actual. */
export interface LoginResult {
  idToken: string;
  expiresIn: string;
  localId: string;
  email: string | null;
  displayName: string;
  rol: string;
  tiendaId: string;
}

const EXPIRES_IN_SECONDS = 60 * 60 * 8; // 8 h de jornada

/**
 * Capa de negocio de autenticación: valida credenciales y emite el JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const usuario = await this.repo.findByLogin(dto.email);
    const ok =
      usuario && (await bcrypt.compare(dto.password, usuario.passwordHash));
    if (!usuario || !ok) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rolNombre,
      tiendaId: usuario.tiendaId,
    };
    const idToken = await this.jwt.signAsync(payload, {
      expiresIn: EXPIRES_IN_SECONDS,
    });

    return {
      idToken,
      expiresIn: String(EXPIRES_IN_SECONDS),
      localId: usuario.id,
      email: usuario.email ?? null,
      displayName: usuario.nombre,
      rol: usuario.rolNombre,
      tiendaId: usuario.tiendaId,
    };
  }
}
