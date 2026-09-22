import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import axiosInstance from "../../../services/AxiosInstance";
import { money } from "./format";
import { imprimirHtml } from "./recibo";

const hoy = () => {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CierreCaja = () => {
	const [fecha, setFecha] = useState(hoy());
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [preview, setPreview] = useState(false);

	const cargar = useCallback(async (f) => {
		try {
			const { data } = await axiosInstance.get(`/cierre-caja?fecha=${f}`);
			setData(data); setError("");
		} catch {
			setError("No se pudo cargar el cierre.");
		}
	}, []);

	useEffect(() => { cargar(fecha); }, [fecha, cargar]);

	const r = data || { total: 0, cantidad: 0, abonos: 0, porMetodo: [] };

	const cierreHtml = () => {
		const q = (n) => "Q " + Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		const filas = (r.porMetodo || []).map((m) =>
			`<tr><td>${m.metodoPago}</td><td style="text-align:center">${m.cantidad}</td><td style="text-align:right">${q(m.total)}</td></tr>`).join("");
		return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cierre ${r.fecha}</title>
			<style>*{font-family:Arial,sans-serif}body{max-width:420px;margin:0 auto;padding:16px;color:#000}
			h1{font-size:18px;text-align:center;margin:4px 0}.muted{text-align:center;font-size:12px;color:#333}
			table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border-bottom:1px solid #ccc;padding:6px;font-size:13px}
			.tot{font-size:16px;font-weight:bold}hr{border:none;border-top:1px dashed #000;margin:8px 0}</style></head><body>
			<h1>Distribuidora del Sol</h1>
			<div class="muted">Cierre de caja · ${r.fecha}</div><hr>
			<div><strong>Ventas del día:</strong> ${r.cantidad}</div>
			<div><strong>Abonos a crédito (incluidos):</strong> ${q(r.abonos)}</div>
			<div class="tot"><strong>Total recibido:</strong> ${q(r.total)}</div>
			<table><thead><tr><th>Método</th><th style="text-align:center">Mov.</th><th style="text-align:right">Total</th></tr></thead>
			<tbody>${filas || '<tr><td colspan="3" style="text-align:center">Sin ventas</td></tr>'}</tbody></table>
			</body></html>`;
	};

	return (
		<>
			<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
				<h3 className="mb-0">Cierre de caja</h3>
				<div className="d-flex align-items-center gap-2">
					<label className="mb-0">Fecha:</label>
					<input type="date" className="form-control" style={{ width: 170 }}
						value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
					<button className="btn btn-primary" onClick={() => setPreview(true)} disabled={!data}>
						<i className="bi bi-printer me-1"></i>Imprimir
					</button>
				</div>
			</div>

			{error && <div className="alert alert-warning">{error}</div>}

			<div className="row">
				<div className="col-sm-4">
					<div className="card"><div className="card-body">
						<span className="text-muted">Total recibido (caja)</span>
						<h2 className="text-primary mb-0">{money(r.total)}</h2>
					</div></div>
				</div>
				<div className="col-sm-4">
					<div className="card"><div className="card-body">
						<span className="text-muted">Número de ventas</span>
						<h2 className="mb-0">{r.cantidad}</h2>
					</div></div>
				</div>
				<div className="col-sm-4">
					<div className="card"><div className="card-body">
						<span className="text-muted">Abonos a crédito (incluidos)</span>
						<h2 className="mb-0">{money(r.abonos)}</h2>
					</div></div>
				</div>
			</div>

			<div className="card">
				<div className="card-header"><h4 className="card-title mb-0">Desglose por método de pago</h4></div>
				<div className="card-body">
					<div className="table-responsive">
						<table className="table table-striped">
							<thead><tr><th>Método</th><th className="text-center">Ventas</th><th className="text-end">Total</th></tr></thead>
							<tbody>
								{r.porMetodo.length === 0 && (
									<tr><td colSpan={3} className="text-center text-muted py-4">Sin ventas en esta fecha.</td></tr>
								)}
								{r.porMetodo.map((m) => (
									<tr key={m.metodoPago}>
										<td>{m.metodoPago}</td>
										<td className="text-center">{m.cantidad}</td>
										<td className="text-end fw-bold">{money(m.total)}</td>
									</tr>
								))}
							</tbody>
							{r.porMetodo.length > 0 && (
								<tfoot><tr className="fw-bold">
									<td>Total</td><td className="text-center">{r.cantidad}</td><td className="text-end text-primary">{money(r.total)}</td>
								</tr></tfoot>
							)}
						</table>
					</div>
				</div>
			</div>

			<Modal show={preview} onHide={() => setPreview(false)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Cierre de caja · {r.fecha}</h5>
					<button type="button" className="btn-close" onClick={() => setPreview(false)}></button>
				</div>
				<div className="modal-body">
					<div className="d-flex justify-content-between"><span>Ventas del día</span><strong>{r.cantidad}</strong></div>
					<div className="d-flex justify-content-between mb-2"><span>Total</span><strong className="text-primary">{money(r.total)}</strong></div>
					<table className="table table-sm">
						<thead><tr><th>Método</th><th className="text-center">Ventas</th><th className="text-end">Total</th></tr></thead>
						<tbody>
							{r.porMetodo.length === 0 && <tr><td colSpan={3} className="text-center text-muted">Sin ventas</td></tr>}
							{r.porMetodo.map((m) => (
								<tr key={m.metodoPago}><td>{m.metodoPago}</td><td className="text-center">{m.cantidad}</td><td className="text-end">{money(m.total)}</td></tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" onClick={() => setPreview(false)}>Cerrar</button>
					<button type="button" className="btn btn-primary" onClick={() => imprimirHtml(cierreHtml())}>
						<i className="bi bi-printer me-1"></i>Imprimir
					</button>
				</div>
			</Modal>
		</>
	);
};

export default CierreCaja;
