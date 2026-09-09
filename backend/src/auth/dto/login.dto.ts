import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /** Identificador de acceso: username o email. */
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
