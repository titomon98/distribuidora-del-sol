import {
  IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength,
} from 'class-validator';

/** Cuerpo para crear/actualizar un producto (validado + whitelist). */
export class ProductoDto {
  @IsString() @MinLength(1) @MaxLength(200)
  nombre: string;

  @IsOptional() @IsString() @MaxLength(255)
  descripcion?: string;

  @IsOptional() @IsString() @MaxLength(60)
  codigoBarras?: string;

  @IsOptional() @IsUUID()
  marcaId?: string;

  @IsOptional() @IsUUID()
  tipoProductoId?: string;

  @IsOptional() @IsNumber() @Min(0)
  precioCompra?: number;

  @IsOptional() @IsNumber() @Min(0)
  precioMayorista?: number;

  @IsOptional() @IsNumber() @Min(0)
  precioVenta?: number;

  @IsOptional() @IsNumber() @Min(0)
  stockMinimo?: number;
}
