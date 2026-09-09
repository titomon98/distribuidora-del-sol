import React, { useMemo } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axiosInstance from "../../../services/AxiosInstance";

// Debounce que devuelve una promesa (para loadOptions de react-select).
function debouncePromise(fn, delay) {
	let timer;
	return (arg) =>
		new Promise((resolve) => {
			clearTimeout(timer);
			timer = setTimeout(() => resolve(fn(arg)), delay);
		});
}

// Se monta sobre document.body para no recortarse dentro de modales/cards.
const estilos = {
	menuPortal: (base) => ({ ...base, zIndex: 9999 }),
	control: (base) => ({ ...base, minHeight: 38 }),
};

/**
 * Selector con búsqueda estilo vue-select.
 *  - `endpoint`: modo async (busca en el backend con ?search=, debounce, sin
 *     precargar). El backend limita resultados.
 *  - `options`: modo estático (searchable en cliente) para listas pequeñas.
 *
 * `value` es el objeto opción ({value,label,raw}) o null; `onChange(opción)`.
 */
const SearchSelect = ({
	endpoint, options, value, onChange, placeholder = "Buscar…",
	getLabel = (o) => o.nombre, isClearable = true,
}) => {
	const cargar = useMemo(() => debouncePromise(async (input) => {
		const url = `/${endpoint}${input ? `?search=${encodeURIComponent(input)}` : ""}`;
		const { data } = await axiosInstance.get(url);
		return (data || []).map((o) => ({ value: o.id, label: getLabel(o), raw: o }));
	}, 300), [endpoint, getLabel]);

	const comun = {
		value, onChange, isClearable, placeholder,
		menuPortalTarget: typeof document !== "undefined" ? document.body : null,
		styles: estilos,
		classNamePrefix: "rs",
		noOptionsMessage: ({ inputValue }) => (inputValue ? "Sin resultados" : "Escribe para buscar…"),
		loadingMessage: () => "Buscando…",
	};

	if (endpoint) {
		return <AsyncSelect {...comun} cacheOptions defaultOptions={false} loadOptions={cargar} />;
	}

	const opts = (options || []).map((o) => ({ value: o.id, label: getLabel(o), raw: o }));
	return <Select {...comun} options={opts} />;
};

export default SearchSelect;
