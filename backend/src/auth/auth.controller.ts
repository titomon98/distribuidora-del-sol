import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, JwtPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Capa de presentación (HTTP) del módulo de autenticación. */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Devuelve el usuario del token; sirve para validar la sesión. */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return (req as Request & { user: JwtPayload }).user;
  }
}
