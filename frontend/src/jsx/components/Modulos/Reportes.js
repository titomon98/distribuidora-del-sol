import React from "react";
import ListView from "./ListView";
import { money, fecha } from "./format";

const num = (v) => Number(v || 0);

export const ReporteVentas = () => (
	<ListView title="Reporte de ventas" endpoint="reportes/ventas" emptyText="Sin ventas."
		dateFilter exportable exportName="reporte-ventas" totalField="total"
		columns={[
			{ name: "numeroVenta", label: "No. venta" },
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "cliente", label: "Cliente" },
			{ name: "usuario", label: "Cajero" },
			{ name: "metodoPago", label: "Método" },
			{ name: "estadoDespacho", label: "Despacho" },
			{ name: "total", label: "Total", format: money, exportFormat: num },
		]} />
);

export const ReporteCompras = () => (
	<ListView title="Reporte de compras" endpoint="reportes/compras" emptyText="Sin compras."
		dateFilter exportable exportName="reporte-compras" totalField="total"
		columns={[
			{ name: "numeroCompra", label: "No. compra" },
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "proveedor", label: "Proveedor" },
			{ name: "usuario", label: "Usuario" },
			{ name: "tipoPago", label: "Pago" },
			{ name: "total", label: "Total", format: money, exportFormat: num },
		]} />
);

export const ReporteProductos = () => (
	<ListView title="Reporte de productos" endpoint="reportes/productos" emptyText="Sin productos."
		exportable exportName="reporte-productos"
		columns={[
			{ name: "nombre", label: "Producto" },
			{ name: "codigoBarras", label: "Código" },
			{ name: "precioVenta", label: "Precio venta", format: money, exportFormat: num },
			{ name: "stock", label: "Stock" },
			{ name: "vendidos", label: "Unid. vendidas" },
		]} />
);

export const ReporteUsuarios = () => (
	<ListView title="Reporte de acciones por usuario" endpoint="reportes/usuarios"
		emptyText="Sin registros de auditoría." dateFilter exportable exportName="reporte-usuarios"
		columns={[
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "usuario", label: "Usuario" },
			{ name: "accion", label: "Acción" },
			{ name: "tabla", label: "Tabla" },
		]} />
);
