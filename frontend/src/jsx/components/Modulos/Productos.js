import React from "react";
import CrudResource from "./CrudResource";

const money = (n) =>
	n == null ? "—" : "Q " + Number(n).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Productos = () => (
	<CrudResource
		title="Productos"
		endpoint="productos"
		columns={[
			{ name: "nombre", label: "Nombre" },
			{ name: "codigoBarras", label: "Código de barras" },
			{ name: "marcaId", label: "Marca", lookup: "marcaId" },
			{ name: "tipoProductoId", label: "Categoría", lookup: "tipoProductoId" },
			{ name: "precioVenta", label: "Precio venta", format: money },
			{ name: "stock", label: "Stock" },
			{ name: "lotes", label: "Lotes" },
			{ name: "stockMinimo", label: "Stock mín." },
		]}
		fields={[
			{ name: "nombre", label: "Nombre", type: "text", required: true },
			{ name: "codigoBarras", label: "Código de barras", type: "text" },
			{ name: "marcaId", label: "Marca", type: "select", optionsEndpoint: "marcas" },
			{ name: "tipoProductoId", label: "Categoría", type: "select", optionsEndpoint: "categorias" },
			{ name: "precioCompra", label: "Precio de compra (Q)", type: "number" },
			{ name: "precioMayorista", label: "Precio mayorista (Q)", type: "number" },
			{ name: "precioVenta", label: "Precio de venta (Q)", type: "number" },
			{ name: "stockMinimo", label: "Stock mínimo", type: "number" },
			{ name: "descripcion", label: "Descripción", type: "textarea" },
		]}
	/>
);

export default Productos;
