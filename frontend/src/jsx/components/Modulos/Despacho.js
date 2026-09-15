import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import ListView from "./ListView";
import axiosInstance from "../../../services/AxiosInstance";
import { getSocket } from "../../../services/socket";
import { money, fecha } from "./format";

const Despacho = () => {
	const [refreshKey, setRefreshKey] = useState(0);
	const [detalle, setDetalle] = useState(null); // venta con items
	const [cargando, setCargando] = useState(false);
	const [despachando, setDespachando] = useState(false);
	const reloadRef = useRef(null);

	// Recarga en vivo ante ventas nuevas / despachadas (cobro ↔ despacho).
	useEffect(() => {
		const s = getSocket();
		const onEvent = () => setRefreshKey((k) => k + 1);
		s.on("venta:nueva", onEvent);
		s.on("venta:despachada", onEvent);
		return () => { s.off("venta:nueva", onEvent); s.off("venta:despachada", onEvent); };
	}, []);

	const abrir = async (row, reload) => {
		reloadRef.current = reload;
		setCargando(true);
		setDetalle({ id: row.id, numeroVenta: row.numeroVenta, cliente: row.cliente, total: row.total, items: [] });
		try {
			const { data } = await axiosInstance.get(`/ventas/${row.id}`);
			setDetalle(data);
		} catch {
			swal("Error", "No se pudo cargar el detalle de la venta.", "error");
			setDetalle(null);
		} finally { setCargando(false); }
	};

	const confirmar = async () => {
		if (!detalle) return;
		setDespachando(true);
		try {
			const { data } = await axiosInstance.patch(`/ventas/${detalle.id}/despachar`);
			if (data.actualizado === false) {
				swal("Aviso", "Este pedido ya había sido despachado.", "info");
			}
			setDetalle(null);
			if (reloadRef.current) await reloadRef.current();
		} catch {
			swal("Error", "No se pudo despachar.", "error");
		} finally { setDespachando(false); }
	};

	return (
		<>
			<ListView
				title="Pedidos pendientes de despacho"
				refreshKey={refreshKey}
				endpoint="ventas?estadoDespacho=PENDIENTE"
				emptyText="No hay pedidos pendientes."
				columns={[
					{ name: "numeroVenta", label: "No. venta" },
					{ name: "fecha", label: "Fecha", format: fecha },
					{ name: "cliente", label: "Cliente" },
					{ name: "total", label: "Total", format: money },
					{ name: "usuario", label: "Cajero" },
				]}
				actions={(row, reload) => (
					<button className="btn btn-sm btn-primary" onClick={() => abrir(row, reload)}>
						<i className="bi bi-box-seam me-1"></i>Revisar y despachar
					</button>
				)}
			/>

			<Modal show={!!detalle} onHide={() => setDetalle(null)} centered size="lg">
				<div className="modal-header">
					<h5 className="modal-title">Despachar pedido {detalle?.numeroVenta || detalle?.numero_venta || ""}</h5>
					<button type="button" className="btn-close" onClick={() => setDetalle(null)}></button>
				</div>
				<div className="modal-body">
					<p className="mb-2"><strong>Cliente:</strong> {detalle?.cliente || "Consumidor Final"}</p>
					<p className="text-muted">Verifica que todos los productos estén disponibles físicamente antes de confirmar.</p>
					<div className="table-responsive">
						<table className="table table-striped">
							<thead><tr><th>Producto</th><th className="text-center">Cantidad</th><th className="text-end">Subtotal</th></tr></thead>
							<tbody>
								{cargando && <tr><td colSpan={3} className="text-center py-3">Cargando…</td></tr>}
								{!cargando && (detalle?.items || []).map((it, i) => (
									<tr key={i}>
										<td>{it.producto}</td>
										<td className="text-center"><span className="badge badge-primary">{it.cantidad}</span></td>
										<td className="text-end">{money(it.subtotal)}</td>
									</tr>
								))}
							</tbody>
							<tfoot><tr className="fw-bold"><td colSpan={2}>Total</td><td className="text-end text-primary">{money(detalle?.total)}</td></tr></tfoot>
						</table>
					</div>
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" onClick={() => setDetalle(null)}>Cancelar</button>
					<button type="button" className="btn btn-primary" disabled={despachando || cargando} onClick={confirmar}>
						<i className="bi bi-check2-circle me-1"></i>{despachando ? "Despachando…" : "Confirmar despacho"}
					</button>
				</div>
			</Modal>
		</>
	);
};

export default Despacho;
