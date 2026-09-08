import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source';

/**
 * Módulo raíz.
 *
 * Registra la conexión de TypeORM a partir de la configuración central.
 * Aún NO se conecta a PostgreSQL en la práctica (no se levanta el servidor
 * contra una base real todavía); la configuración queda lista.
 *
 * A medida que se implementen los módulos de dominio (productos, ventas,
 * compras, etc.) se irán agregando aquí.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
})
export class AppModule {}
