import React from "react";
import CrudResource from "./CrudResource";

const Categorias = () => (
	<CrudResource
		title="Categorías"
		endpoint="categorias"
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

export default Categorias;
