import {
  Body, Controller, Delete, ForbiddenException, Get, Injectable, Module,
  Param, Patch, Post, Req, UseGuards, BadRequestException, ConflictException,
} from '@nestjs/common';
import { Request } from 'express';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { reqUser } from '../common/crud/crud.controller';

class CrearUsuarioDto {
  @IsString() @MinLength(1) @MaxLength(150) nombre: string;
  @IsString() @MinLength(3) @MaxLength(60) username: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @IsNotEmpty() rolId: string;
  @IsString() @MinLength(4) @MaxLength(72) password: string;
}
class ActualizarUsuarioDto {
  @IsOptional() @IsString() @MaxLength(150) nombre?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(60) username?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @IsNotEmpty() rolId?: string;
  @IsOptional() @IsString() @MinLength(4) @MaxLength(72) password?: string;
}

@Injectable()
class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Rol) private readonly roles: Repository<Rol>,
  ) {}

  listar(tiendaId: string) {
    return this.usuarios.query(
      `SELECT u.id, u.nombre, u.username, u.email, u.estado, u.rol_id AS "rolId", r.nombre AS rol
       FROM usuario u LEFT JOIN rol r ON r.id = u.rol_id
       WHERE u.tienda_id=$1 AND u.estado <> 'ELIMINADO'
       ORDER BY u.nombre;`, [tiendaId]);
  }

  listarRoles() {
    return this.roles.find({ order: { nombre: 'ASC' } });
  }

  private async assertUsernameLibre(tiendaId: string, username: string, exceptoId?: string) {
    const existe = await this.usuarios.findOne({ where: { tiendaId, username } });
    if (existe && existe.id !== exceptoId) {
      throw new ConflictException(`El usuario "${username}" ya existe.`);
    }
  }

  async crear(tiendaId: string, actorId: string, dto: CrearUsuarioDto) {
    await this.assertUsernameLibre(tiendaId, dto.username);
    const entity = this.usuarios.create({
      tiendaId, nombre: dto.nombre, username: dto.username, email: dto.email ?? null,
      rolId: dto.rolId, passwordHash: await bcrypt.hash(dto.password, 10),
      createdBy: actorId, updatedBy: actorId,
    });
    const saved = await this.usuarios.save(entity);
    return { id: saved.id, nombre: saved.nombre, username: saved.username, email: saved.email, rolId: saved.rolId };
  }

  async actualizar(tiendaId: string, actorId: string, id: string, dto: ActualizarUsuarioDto) {
    const u = await this.usuarios.findOne({ where: { id, tiendaId } });
    if (!u || u.estado === 'ELIMINADO') throw new BadRequestException('Usuario no encontrado');
    if (dto.username) await this.assertUsernameLibre(tiendaId, dto.username, id);
    if (dto.nombre !== undefined) u.nombre = dto.nombre;
    if (dto.username !== undefined) u.username = dto.username;
    if (dto.email !== undefined) u.email = dto.email ?? null;
    if (dto.rolId !== undefined) u.rolId = dto.rolId;
    if (dto.password) u.passwordHash = await bcrypt.hash(dto.password, 10);
    u.updatedBy = actorId;
    await this.usuarios.save(u);
    return { id: u.id };
  }

  async eliminar(tiendaId: string, actorId: string, id: string) {
    const u = await this.usuarios.findOne({ where: { id, tiendaId } });
    if (!u) throw new BadRequestException('Usuario no encontrado');
    if (u.id === actorId) throw new BadRequestException('No puedes eliminar tu propio usuario.');
    u.estado = 'ELIMINADO'; u.updatedBy = actorId;
    await this.usuarios.save(u);
    return { id };
  }
}

@UseGuards(JwtAuthGuard)
@Controller()
class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  private soloAdmin(req: Request) {
    if (reqUser(req).rol !== 'ADMINISTRADOR') {
      throw new ForbiddenException('Solo el administrador puede gestionar usuarios.');
    }
  }

  @Get('roles')
  roles() { return this.service.listarRoles(); }

  @Get('usuarios')
  listar(@Req() req: Request) { this.soloAdmin(req); return this.service.listar(reqUser(req).tiendaId); }

  @Post('usuarios')
  crear(@Body() dto: CrearUsuarioDto, @Req() req: Request) {
    this.soloAdmin(req); const u = reqUser(req);
    return this.service.crear(u.tiendaId, u.sub, dto);
  }

  @Patch('usuarios/:id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto, @Req() req: Request) {
    this.soloAdmin(req); const u = reqUser(req);
    return this.service.actualizar(u.tiendaId, u.sub, id, dto);
  }

  @Delete('usuarios/:id')
  eliminar(@Param('id') id: string, @Req() req: Request) {
    this.soloAdmin(req); const u = reqUser(req);
    return this.service.eliminar(u.tiendaId, u.sub, id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  controllers: [UsuariosController],
  providers: [UsuariosService, JwtAuthGuard],
})
export class UsuariosModule {}
