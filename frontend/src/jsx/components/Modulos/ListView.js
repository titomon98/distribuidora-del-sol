import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";
import { filtrarFilas } from "./tableFilter";
import { exportarExcel, exportarPdf } from "./exportar";

/**
 * Tabla de solo lectura reutilizable.
 * props:
 *  - title, endpoint (ruta relativa a la API)
 *  - columns: [{ name, label, format?(value,row), exportFormat?(value,row) }]
 *  - actions?: (row, reload) => JSX  (columna extra al final)
 *  - emptyText?, refreshKey?
 *  - dateFilter?: agrega filtros desde/hasta (envía ?desde=&hasta=)
 *  - exportable?: agrega botones Exportar Excel / PDF, exportName? nombre de archivo
 */
const ListView = ({ title, endpoint, columns, actions, emptyText, refreshKey,
	dateFilter, exportable, exportName, totalField, filters }) => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [busqueda, setBusqueda] = useState("");
	const [desde, setDesde] = useState("");
	const [hasta, setHasta] = useState("");
	const [filtros, setFiltros] = useState({}); // { campo: valor seleccionado }

	const reload = useCallback(async () => {
		setLoading(true);
		try {
			let url = `/${endpoint}`;
			if (dateFilter && (desde || hasta)) {
				const sep = endpoint.includes("?") ? "&" : "?";
				const qs = [];
				if (desde) qs.push(`desde=${desde}`);
				if (hasta) qs.push(`hasta=${hasta}`);
				url += sep + qs.join("&");
			}
			const { data } = await axiosInstance.get(url);
			setRows(Array.isArray(data) ? data : []);
			setError("");
		} catch {
			setError("No se pudo cargar la información.");
		} finally {
			setLoading(false);
		}
	}, [endpoint, dateFilter, desde, hasta]);

	useEffect(() => { reload(); }, [reload, refreshKey]);

	const colCount = columns.length + (actions ? 1 : 0);
	// Opciones de cada filtro: valores distintos presentes en los datos.
	const opcionesFiltro = (name) =>
		[...new Set(rows.map((r) => r[name]).filter((v) => v != null && v !== ""))].sort();
	const filasFiltradas = rows.filter((row) =>
		(filters || []).every((f) => !filtros[f.name] || row[f.name] === filtros[f.name]));
	const filas = filtrarFilas(filasFiltradas, columns, busqueda, (c, row) => row[c.name]);

	const matrizExport = () => {
		const headers = columns.map((c) => c.label);
		const body = filas.map((row) => columns.map((c) =>
			c.exportFormat ? c.exportFormat(row[c.name], row) : (row[c.name] ?? "")));
		return { headers, body };
	};
	const doExcel = () => { const { headers, body } = matrizExport(); exportarExcel(exportName || title, headers, body); };
	const doPdf = () => { const { headers, body } = matrizExport(); exportarPdf(exportName || title, title, headers, body); };

	return (
		<div className="card">
			<div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
				<h4 className="card-title mb-0">{title}</h4>
				<div className="d-flex align-items-center flex-wrap gap-2">
					{dateFilter && (
						<>
							<input type="date" className="form-control form-control-sm" style={{ width: 150 }}
								value={desde} onChange={(e) => setDesde(e.target.value)} title="Desde" />
							<input type="date" className="form-control form-control-sm" style={{ width: 150 }}
								value={hasta} onChange={(e) => setHasta(e.target.value)} title="Hasta" />
						</>
					)}
					{(filters || []).map((f) => (
						<select key={f.name} className="form-control form-control-sm" style={{ width: 160 }}
							value={filtros[f.name] || ""} title={f.label}
							onChange={(e) => setFiltros({ ...filtros, [f.name]: e.target.value })}>
							<option value="">{f.label}: todas</option>
							{opcionesFiltro(f.name).map((v) => <option key={v} value={v}>{v}</option>)}
						</select>
					))}
					<input type="search" className="form-control form-control-sm" style={{ maxWidth: 200 }}
						placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
					{exportable && (
						<>
							<button className="btn btn-sm btn-success" onClick={doExcel} title="Exportar a Excel">
								<i className="bi bi-file-earmark-spreadsheet"></i> Excel
							</button>
							<button className="btn btn-sm btn-danger" onClick={doPdf} title="Exportar a PDF">
								<i className="bi bi-file-earmark-pdf"></i> PDF
							</button>
						</>
					)}
				</div>
			</div>
			<div className="card-body">
				{error && <div className="alert alert-warning">{error}</div>}
				<div className="table-responsive">
					<table className="table table-striped verticle-middle">
						<thead>
							<tr>
								{columns.map((c) => <th key={c.name}>{c.label}</th>)}
								{actions && <th className="text-end">Acciones</th>}
							</tr>
						</thead>
						<tbody>
							{loading && <tr><td colSpan={colCount} className="text-center py-4">Cargando…</td></tr>}
							{!loading && filas.length === 0 && (
								<tr><td colSpan={colCount} className="text-center text-muted py-4">{busqueda ? "Sin coincidencias." : (emptyText || "Sin registros.")}</td></tr>
							)}
							{!loading && filas.map((row, i) => (
								<tr key={row.id || i}>
									{columns.map((c) => (
										<td key={c.name}>{c.format ? c.format(row[c.name], row) : (row[c.name] ?? "-")}</td>
									))}
									{actions && <td className="text-end text-nowrap">{actions(row, reload)}</td>}
								</tr>
							))}
						</tbody>
						{totalField && !loading && filas.length > 0 && (() => {
							const col = columns.find((c) => c.name === totalField);
							const suma = filas.reduce((s, row) => s + Number(row[totalField] || 0), 0);
							return (
								<tfoot>
									<tr className="fw-bold">
										{columns.map((c, i) => (
											<td key={c.name} className={c.name === totalField ? "text-end text-primary" : ""}>
												{c.name === totalField ? (col?.format ? col.format(suma) : suma) : (i === 0 ? "Total" : "")}
											</td>
										))}
										{actions && <td></td>}
									</tr>
								</tfoot>
							);
						})()}
					</table>
				</div>
			</div>
		</div>
	);
};

export default ListView;
