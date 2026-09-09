/**
 * Filtra filas por un texto de búsqueda, comparando contra las columnas que se
 * muestran en la tabla. `getCell(col, row)` devuelve el valor buscable de cada
 * columna (crudo o etiqueta resuelta para lookups).
 */
export function filtrarFilas(rows, columns, query, getCell) {
	const t = (query || "").trim().toLowerCase();
	if (!t) return rows;
	return rows.filter((row) =>
		columns.some((c) => String(getCell(c, row) ?? "").toLowerCase().includes(t)),
	);
}
