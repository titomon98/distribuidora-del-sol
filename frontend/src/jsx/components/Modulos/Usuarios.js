import React from "react";
import CrudResource from "./CrudResource";

const Usuarios = () => (
	<CrudResource
		title="Usuarios"
		endpoint="usuarios"
		columns={[
			{ name: "nombre", label: "Nombre" },
			{ name: "username", label: "Usuario" },
			{ name: "email", label: "Correo" },
			{ name: "rolId", label: "Rol", lookup: "rolId" },
		]}
		fields={[
			{ name: "nombre", label: "Nombre", type: "text", required: true },
			{ name: "username", label: "Usuario", type: "text", required: true },
			{ name: "email", label: "Correo", type: "text" },
			{ name: "rolId", label: "Rol", type: "select", optionsEndpoint: "roles", required: true },
			{ name: "password", label: "Contraseña", type: "password",
				placeholder: "Dejar vacío para no cambiarla" },
		]}
	/>
);

export default Usuarios;
