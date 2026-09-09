import React from "react";
import ListView from "./ListView";
import { money, fecha } from "./format";

const num = (v) => Number(v || 0);

const VentasListado = () => (
	<ListView
		title="Listado de ventas"
		endpoint="ventas"
		emptyText="Sin ventas."
		exportable exportName="ventas"
		columns={[
			{ name: "numeroVenta", label: "No. venta" },
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "cliente", label: "Cliente" },
			{ name: "usuario", label: "Cajero" },
			{ name: "metodoPago", label: "Método" },
			{ name: "estadoDespacho", label: "Despacho", format: (v) =>
				<span className={`badge badge-${v === "DESPACHADO" ? "success" : "warning"}`}>{v}</span> },
			{ name: "total", label: "Total", format: money, exportFormat: num },
		]}
	/>
);

export default VentasListado;
