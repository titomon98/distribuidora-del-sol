import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PresentacionesModule } from './presentaciones/presentaciones.module';
import { InventarioModule } from './inventario/inventario.module';
import { VentasModule } from './ventas/ventas.module';
import { CierreCajaModule } from './cierre-caja/cierre-caja.module';
import { ReportesModule } from './reportes/reportes.module';
import { ComprasModule } from './compras/compras.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { CreditosModule } from './creditos/creditos.module';

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
    AuthModule,
    DashboardModule,
    ProductosModule,
    MarcasModule,
    CategoriasModule,
    PresentacionesModule,
    InventarioModule,
    VentasModule,
    CierreCajaModule,
    ReportesModule,
    ComprasModule,
    ProveedoresModule,
    UsuariosModule,
    ClientesModule,
    CreditosModule,
  ],
})
export class AppModule {}
