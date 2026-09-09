import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import ListView from "./ListView";
import axiosInstance from "../../../services/AxiosInstance";
import { money, fecha } from "./format";

const num = (v) => Number(v || 0);
const esAdmin = () => {
	try { return (JSON.parse(localStorage.getItem("userDetails") || "{}")).rol === "ADMINISTRADOR"; }
	catch { return false; }
};

const VentasListado = () => {
	const [detalle, setDetalle] = useState(null);
	const [cargando, setCargando] = useState(false);
	const admin = esAdmin();

	const ver = async (row) => {
		setCargando(true);
		setDetalle({ numeroVenta: row.numeroVenta, cliente: row.cliente, total: row.total, items: [], pagos: [] });
		try {
			const { data } = await axiosInstance.get(`/ventas/${row.id}`);
			setDetalle(data);
		} catch { /* noop */ } finally { setCargando(false); }
	};

	const anular = async (row, reload) => {
		const ok = await swal({
			title: "¿Anular venta?", text: `Se devolverá el stock de ${row.numeroVenta}.`,
			icon: "warning", buttons: ["Cancelar", "Anular"], dangerMode: true,
		});
		if (!ok) return;
		try { await axiosInstance.patch(`/ventas/${row.id}/anular`); await reload(); }
		catch (err) { swal("Error", err?.response?.data?.message || "No se pudo anular.", "error"); }
	};

	return (
		<>
			<ListView
				title="Listado de ventas"
				endpoint="ventas"
				emptyText="Sin ventas."
				exportable exportName="ventas" totalField="total"
				columns={[
					{ name: "numeroVenta", label: "No. venta" },
					{ name: "fecha", label: "Fecha", format: fecha, exportFormat: fecha },
					{ name: "cliente", label: "Cliente" },
					{ name: "usuario", label: "Cajero" },
					{ name: "metodoPago", label: "Método" },
					{ name: "estadoDespacho", label: "Despacho", format: (v) =>
						<span className={`badge badge-${v === "DESPACHADO" ? "success" : "warning"}`}>{v}</span> },
					{ name: "estado", label: "Estado", format: (v) =>
						<span className={`badge badge-${v === "ANULADO" ? "danger" : "success"}`}>{v === "ANULADO" ? "ANULADA" : "OK"}</span> },
					{ name: "total", label: "Total", format: money, exportFormat: num },
				]}
				actions={(row, reload) => (
					<>
						<button className="btn btn-sm btn-info light me-1" title="Ver detalle" onClick={() => ver(row)}>
							<i className="bi bi-eye"></i>
						</button>
						{admin && row.estado !== "ANULADO" && (
							<button className="btn btn-sm btn-danger light" title="Anular venta" onClick={() => anular(row, reload)}>
								<i className="bi bi-x-octagon"></i>
							</button>
						)}
					</>
				)}
			/>

			<Modal show={!!detalle} onHide={() => setDetalle(null)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Venta {detalle?.numeroVenta || detalle?.numero_venta || ""}</h5>
					<button type="button" className="btn-close" onClick={() => setDetalle(null)}></button>
				</div>
				<div className="modal-body">
					<p className="mb-1"><strong>Cliente:</strong> {detalle?.cliente || "Consumidor Final"}</p>
					<p className="mb-2"><strong>Cajero:</strong> {detalle?.usuario || "-"}</p>
					<table className="table table-sm">
						<thead><tr><th>Producto</th><th className="text-center">Cant.</th><th className="text-end">Subtotal</th></tr></thead>
						<tbody>
							{cargando && <tr><td colSpan={3} className="text-center py-3">Cargando…</td></tr>}
							{!cargando && (detalle?.items || []).map((it, i) => (
								<tr key={i}><td>{it.producto}</td><td className="text-center">{it.cantidad}</td><td className="text-end">{money(it.subtotal)}</td></tr>
							))}
						</tbody>
						<tfoot><tr className="fw-bold"><td colSpan={2}>Total</td><td className="text-end text-primary">{money(detalle?.total)}</td></tr></tfoot>
					</table>
					{(detalle?.pagos || []).length > 0 && (
						<>
							<h6>Pagos</h6>
							<ul className="list-unstyled mb-0">
								{detalle.pagos.map((p, i) => (
									<li key={i} className="d-flex justify-content-between"><span>{p.metodoPago}</span><span>{money(p.monto)}</span></li>
								))}
							</ul>
						</>
					)}
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
				</div>
			</Modal>
		</>
	);
};

export default VentasListado;
