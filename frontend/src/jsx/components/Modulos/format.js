import React from "react";

export const money = (n) =>
	n == null || n === "" ? "-"
		: "Q " + Number(n).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fecha = (v) => {
	if (!v) return "-";
	const d = new Date(v);
	return isNaN(d) ? "-" : d.toLocaleString("es-GT", {
		year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
	});
};

// Fecha corta dd/mm/aaaa para columnas DATE (sin hora, sin desfase de zona horaria).
export const fechaCorta = (v) => {
	if (!v) return "-";
	const [y, m, d] = String(v).slice(0, 10).split("-");
	return (y && m && d) ? `${d}/${m}/${y}` : "-";
};

/** Badge de alerta de stock (JSX). */
export const alertaBadge = (a) => {
	const map = { OK: "success", BAJO: "warning", AGOTADO: "danger" };
	return React.createElement("span", { className: `badge badge-${map[a] || "secondary"}` }, a);
};
