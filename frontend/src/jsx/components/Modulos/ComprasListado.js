import React from "react";
import ListView from "./ListView";
import { money, fecha } from "./format";

const num = (v) => Number(v || 0);

const ComprasListado = () => (
	<ListView
		title="Listado de compras"
		endpoint="compras"
		emptyText="Sin compras."
		exportable exportName="compras"
		columns={[
			{ name: "numeroCompra", label: "No. compra" },
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "proveedor", label: "Proveedor" },
			{ name: "usuario", label: "Usuario" },
			{ name: "tipoPago", label: "Pago" },
			{ name: "total", label: "Total", format: money, exportFormat: num },
		]}
	/>
);

export default ComprasListado;
