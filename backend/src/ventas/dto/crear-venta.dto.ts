import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';

class ItemVentaDto {
  @IsUUID()
  productoId: string;

  @IsInt() @Min(1)
  cantidad: number;

  @IsNumber() @Min(0)
  precioUnitario: number;
}

class PagoVentaDto {
  @IsString()
  metodoPago: string;

  @IsNumber() @Min(0)
  monto: number;
}

export class CrearVentaDto {
  @IsOptional() @IsString()
  clienteId?: string;

  @IsOptional() @IsString()
  metodoPago?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PagoVentaDto)
  pagos?: PagoVentaDto[];

  @IsOptional() @IsString()
  tipo?: string;

  @IsArray() @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  items: ItemVentaDto[];
}
