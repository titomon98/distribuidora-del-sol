import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret-cambiar',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthGuard],
})
export class AuthModule {}
