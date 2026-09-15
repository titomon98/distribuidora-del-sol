import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import axiosInstance from "../../../services/AxiosInstance";
import { filtrarFilas } from "./tableFilter";
import SearchSelect from "./SearchSelect";

/**
 * Recurso CRUD genérico reutilizable para los módulos de catálogo/directorio.
 *
 * props:
 *  - title, endpoint (p.ej. 'marcas')
 *  - columns: [{ name, label, format?(value,row), lookup? }]
 *  - fields:  [{ name, label, type:'text'|'number'|'textarea'|'select', required?,
 *               optionsEndpoint?, optionLabel='nombre' }]
 */
const CrudResource = ({ title, endpoint, columns, fields }) => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [options, setOptions] = useState({}); // fieldName -> [{id,label}]
	const [show, setShow] = useState(false);
	const [editId, setEditId] = useState(null);
	const [form, setForm] = useState({});
	const [saving, setSaving] = useState(false);
	const [busqueda, setBusqueda] = useState("");

	const cargar = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await axiosInstance.get(`/${endpoint}`);
			setRows(data);
			setError("");
		} catch {
			setError("No se pudo cargar la información.");
		} finally {
			setLoading(false);
		}
	}, [endpoint]);

	useEffect(() => { cargar(); }, [cargar]);

	// Cargar opciones de los selects una sola vez.
	useEffect(() => {
		fields.filter((f) => f.optionsEndpoint).forEach(async (f) => {
			try {
				const { data } = await axiosInstance.get(`/${f.optionsEndpoint}`);
				setOptions((prev) => ({
					...prev,
					[f.name]: data.map((o) => ({ id: o.id, label: o[f.optionLabel || "nombre"] })),
				}));
			} catch { /* opcional */ }
		});
	}, [fields]);

	const lookupLabel = (fieldName, id) =>
		(options[fieldName] || []).find((o) => o.id === id)?.label || "-";

	const abrirNuevo = () => { setEditId(null); setForm({}); setShow(true); };
	const abrirEdicion = (row) => {
		const f = {};
		fields.forEach((fl) => { f[fl.name] = row[fl.name] ?? ""; });
		setEditId(row.id); setForm(f); setShow(true);
	};

	const guardar = async (e) => {
		e.preventDefault();
		const payload = {};
		for (const f of fields) {
			let v = form[f.name];
			if (v === "" || v === undefined || v === null) {
				if (f.required) { swal("Falta un campo", `${f.label} es obligatorio.`, "warning"); return; }
				continue;
			}
			payload[f.name] = f.type === "number" ? Number(v) : v;
		}
		setSaving(true);
		try {
			if (editId) await axiosInstance.patch(`/${endpoint}/${editId}`, payload);
			else await axiosInstance.post(`/${endpoint}`, payload);
			setShow(false);
			await cargar();
		} catch (err) {
			const msg = err?.response?.data?.message;
			swal("Error", Array.isArray(msg) ? msg.join("\n") : (msg || "No se pudo guardar."), "error");
		} finally {
			setSaving(false);
		}
	};

	const eliminar = async (row) => {
		const ok = await swal({
			title: "¿Eliminar?", text: `Se eliminará "${row.nombre || row.id}".`,
			icon: "warning", buttons: ["Cancelar", "Eliminar"], dangerMode: true,
		});
		if (!ok) return;
		try { await axiosInstance.delete(`/${endpoint}/${row.id}`); await cargar(); }
		catch { swal("Error", "No se pudo eliminar.", "error"); }
	};

	const cellValue = (col, row) => {
		if (col.lookup) return lookupLabel(col.lookup, row[col.name]);
		if (col.format) return col.format(row[col.name], row);
		return row[col.name] ?? "-";
	};

	const filas = filtrarFilas(rows, columns, busqueda,
		(c, row) => (c.lookup ? lookupLabel(c.lookup, row[c.name]) : row[c.name]));

	return (
		<div className="row">
			<div className="col-12">
				<div className="card">
					<div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
						<h4 className="card-title mb-0">{title}</h4>
						<div className="d-flex align-items-center gap-2">
							<input type="search" className="form-control form-control-sm" style={{ maxWidth: 220 }}
								placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
							<button className="btn btn-primary btn-sm text-nowrap" onClick={abrirNuevo}>
								<i className="bi bi-plus-lg me-1"></i>Nuevo
							</button>
						</div>
					</div>
					<div className="card-body">
						{error && <div className="alert alert-warning">{error}</div>}
						<div className="table-responsive">
							<table className="table table-striped verticle-middle">
								<thead>
									<tr>
										{columns.map((c) => <th key={c.name}>{c.label}</th>)}
										<th className="text-end">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{loading && (
										<tr><td colSpan={columns.length + 1} className="text-center py-4">Cargando…</td></tr>
									)}
									{!loading && filas.length === 0 && (
										<tr><td colSpan={columns.length + 1} className="text-center text-muted py-4">{busqueda ? "Sin coincidencias." : "Sin registros. Crea el primero."}</td></tr>
									)}
									{!loading && filas.map((row) => (
										<tr key={row.id}>
											{columns.map((c) => <td key={c.name}>{cellValue(c, row)}</td>)}
											<td className="text-end text-nowrap">
												<button className="btn btn-sm me-1"
													style={{ background: "#C77E12", borderColor: "#C77E12", color: "#fff" }}
													onClick={() => abrirEdicion(row)}>
													<i className="bi bi-pencil"></i>
												</button>
												<button className="btn btn-sm btn-danger light" onClick={() => eliminar(row)}>
													<i className="bi bi-trash"></i>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<Modal show={show} onHide={() => setShow(false)} centered>
				<form onSubmit={guardar}>
					<div className="modal-header">
						<h5 className="modal-title">{editId ? "Editar" : "Nuevo"} - {title}</h5>
						<button type="button" className="btn-close" onClick={() => setShow(false)}></button>
					</div>
					<div className="modal-body">
						{fields.map((f) => (
							<div className="mb-3" key={f.name}>
								<label className="form-label">
									{f.label}{f.required && <span className="text-danger"> *</span>}
								</label>
								{f.type === "textarea" ? (
									<textarea className="form-control" value={form[f.name] ?? ""}
										onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
								) : f.type === "select" ? (
									<SearchSelect
										options={options[f.name] || []}
										getLabel={(o) => o.label}
										value={form[f.name] ? { value: form[f.name], label: lookupLabel(f.name, form[f.name]) } : null}
										onChange={(o) => setForm({ ...form, [f.name]: o?.value || "" })}
										placeholder="Buscar…"
									/>
								) : (
									<input type={f.type === "number" ? "number" : f.type === "password" ? "password" : "text"} step="0.01"
										autoComplete={f.type === "password" ? "new-password" : "off"}
										placeholder={f.placeholder || ""}
										className="form-control" value={form[f.name] ?? ""}
										onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
								)}
							</div>
						))}
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancelar</button>
						<button type="submit" className="btn btn-primary" disabled={saving}>
							{saving ? "Guardando…" : "Guardar"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
};

export default CrudResource;
