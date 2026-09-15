import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ListView from "./ListView";
import axiosInstance from "../../../services/AxiosInstance";
import { money, fecha, alertaBadge } from "./format";

const Inventario = () => {
	const navigate = useNavigate();
	const [lotesModal, setLotesModal] = useState(null); // { producto, lotes, cargando }

	const verLotes = async (row) => {
		setLotesModal({ producto: row.nombre, lotes: [], cargando: true });
		try {
			const { data } = await axiosInstance.get(`/inventario/${row.id}/lotes`);
			setLotesModal({ producto: row.nombre, lotes: data, cargando: false });
		} catch {
			setLotesModal({ producto: row.nombre, lotes: [], cargando: false });
		}
	};

	return (
		<>
			<ListView
				title="Existencias"
				endpoint="inventario"
				emptyText="No hay productos registrados."
				columns={[
					{ name: "nombre", label: "Producto" },
					{ name: "codigoBarras", label: "Código" },
					{ name: "stock", label: "Stock actual" },
					{ name: "lotes", label: "Lotes", format: (v, row) => (
						<button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => verLotes(row)}>
							{v} <i className="bi bi-eye ms-1"></i>
						</button>
					) },
					{ name: "stockMinimo", label: "Stock mínimo" },
					{ name: "precioVenta", label: "Precio venta", format: money },
					{ name: "alerta", label: "Estado", format: (v) => alertaBadge(v) },
				]}
				actions={(row) => (
					row.alerta === "AGOTADO" ? (
						<button className="btn btn-sm btn-warning" onClick={() => navigate("/compras")}>
							<i className="bi bi-cart me-1"></i>Comprar
						</button>
					) : (
						<button className="btn btn-sm btn-primary" onClick={() => navigate("/venta-manual")}>
							<i className="bi bi-cash-stack me-1"></i>Vender
						</button>
					)
				)}
			/>

			<ListView
				title="Historial de movimientos"
				endpoint="inventario/movimientos"
				emptyText="Sin movimientos."
				columns={[
					{ name: "fecha", label: "Fecha", format: fecha },
					{ name: "tipo", label: "Tipo", format: (v) =>
						<span className={`badge badge-${v === "ENTRADA" ? "success" : "danger"}`}>{v}</span> },
					{ name: "producto", label: "Producto" },
					{ name: "cantidad", label: "Cantidad" },
					{ name: "usuario", label: "Usuario" },
				]}
			/>

			<Modal show={!!lotesModal} onHide={() => setLotesModal(null)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Lotes de {lotesModal?.producto}</h5>
					<button type="button" className="btn-close" onClick={() => setLotesModal(null)}></button>
				</div>
				<div className="modal-body">
					<div className="table-responsive">
						<table className="table table-sm">
							<thead><tr><th>Lote</th><th className="text-center">Disponible</th><th className="text-end">Costo</th><th>Ingreso</th><th>Vence</th></tr></thead>
							<tbody>
								{lotesModal?.cargando && <tr><td colSpan={5} className="text-center py-3">Cargando…</td></tr>}
								{!lotesModal?.cargando && (lotesModal?.lotes || []).length === 0 && (
									<tr><td colSpan={5} className="text-center text-muted py-3">Sin lotes con stock.</td></tr>
								)}
								{!lotesModal?.cargando && (lotesModal?.lotes || []).map((l, i) => (
									<tr key={i}>
										<td>{l.codigoLote || "-"}</td>
										<td className="text-center">{l.cantidadDisponible}</td>
										<td className="text-end">{money(l.costoUnitario)}</td>
										<td>{l.fechaIngreso ? String(l.fechaIngreso).slice(0, 10) : "-"}</td>
										<td>{l.fechaVencimiento ? String(l.fechaVencimiento).slice(0, 10) : "-"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default Inventario;
