import React from "react";
import CrudResource from "./CrudResource";

const Presentaciones = () => (
	<CrudResource
		title="Presentaciones"
		endpoint="presentaciones"
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

export default Presentaciones;
