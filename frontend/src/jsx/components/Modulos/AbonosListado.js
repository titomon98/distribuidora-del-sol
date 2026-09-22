import React from "react";
import ListView from "./ListView";
import { money, fecha } from "./format";

const num = (v) => Number(v || 0);

/** Registro de abonos de clientes (créditos por cobrar). */
const AbonosListado = () => (
	<ListView
		title="Registro de abonos"
		endpoint="creditos/abonos"
		emptyText="Sin abonos registrados."
		dateFilter exportable exportName="abonos" totalField="monto"
		columns={[
			{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
			{ name: "cliente", label: "Cliente" },
			{ name: "numeroVenta", label: "Venta" },
			{ name: "metodoPago", label: "Método" },
			{ name: "monto", label: "Monto", format: money, exportFormat: num },
		]}
	/>
);

export default AbonosListado;
