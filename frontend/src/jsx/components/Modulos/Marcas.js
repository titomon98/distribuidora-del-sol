import React from "react";
import CrudResource from "./CrudResource";

const Marcas = () => (
	<CrudResource
		title="Marcas"
		endpoint="marcas"
		columns={[
			{ name: "nombre", label: "Nombre" },
			{ name: "descripcion", label: "Descripción" },
		]}
		fields={[
			{ name: "nombre", label: "Nombre", type: "text", required: true },
			{ name: "descripcion", label: "Descripción", type: "textarea" },
		]}
	/>
);

export default Marcas;
