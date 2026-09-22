import React from "react";
import CrudResource from "./CrudResource";

const Proveedores = () => (
	<CrudResource
		title="Proveedores"
		endpoint="proveedores"
		columns={[
			{ name: "nombre", label: "Nombre" },
			{ name: "nit", label: "NIT" },
			{ name: "telefono", label: "Teléfono" },
			{ name: "email", label: "Correo" },
		]}
		fields={[
			{ name: "nombre", label: "Nombre", type: "text", required: true },
			{ name: "nit", label: "NIT", type: "text" },
			{ name: "telefono", label: "Teléfono", type: "text" },
			{ name: "direccion", label: "Dirección", type: "text" },
			{ name: "email", label: "Correo", type: "text" },
		]}
	/>
);

export default Proveedores;
