import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

loadEnv();

/**
 * Configuración central de TypeORM.
 *
 * Se usa tanto por la aplicación NestJS (TypeOrmModule) como por la CLI de
 * TypeORM para ejecutar/revertir migraciones.
 *
 * IMPORTANTE:
 *  - `synchronize` SIEMPRE en false: el esquema se administra únicamente con las
 *    migraciones versionadas en la carpeta /migrations.
 *  - Por ahora no se migra nada a PostgreSQL; estos valores solo quedan listos.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'distribuidora_del_sol',
  // Entidades: todos los *.entity.ts del proyecto.
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  // Migraciones: carpeta /migrations en la raíz del backend.
  migrations: [join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migraciones_ejecutadas',
  // Suscriptores (auditoría automática de INSERT/UPDATE/DELETE).
  subscribers: [join(__dirname, '..', '**', '*.subscriber.{ts,js}')],
  synchronize: false,
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
