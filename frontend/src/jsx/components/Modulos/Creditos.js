import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import ListView from "./ListView";
import axiosInstance from "../../../services/AxiosInstance";
import { money } from "./format";

const soloFecha = (v) => (v ? String(v).slice(0, 10) : "-");

const Creditos = () => {
	const [abono, setAbono] = useState(null); // { tipo:'cobrar'|'pagar', row, reload }
	const [monto, setMonto] = useState("");
	const [guardando, setGuardando] = useState(false);

	const abrir = (tipo, row, reload) => { setAbono({ tipo, row, reload }); setMonto(""); };

	const registrarAbono = async () => {
		const m = Number(monto);
		if (!m || m <= 0) { swal("Monto inválido", "Ingrese un monto mayor a 0.", "warning"); return; }
		const ruta = abono.tipo === "cobrar" ? "por-cobrar" : "por-pagar";
		setGuardando(true);
		try {
			await axiosInstance.post(`/creditos/${ruta}/${abono.row.id}/abono`, { monto: m });
			const reload = abono.reload;
			setAbono(null);
			await reload();
		} catch (err) {
			swal("Error", err?.response?.data?.message || "No se pudo abonar.", "error");
		} finally { setGuardando(false); }
	};

	const accion = (tipo) => (row, reload) => (
		<button className="btn btn-sm btn-primary" onClick={() => abrir(tipo, row, reload)}>
			<i className="bi bi-cash-stack me-1"></i>Abonar
		</button>
	);

	return (
		<>
			<ListView
				title="Cuentas por cobrar (clientes)"
				endpoint="creditos/por-cobrar"
				emptyText="Sin saldos por cobrar."
				totalField="saldo"
				columns={[
					{ name: "cliente", label: "Cliente" },
					{ name: "numeroVenta", label: "Venta" },
					{ name: "montoTotal", label: "Monto", format: money },
					{ name: "saldo", label: "Saldo", format: money },
					{ name: "fechaVencimiento", label: "Vence", format: soloFecha },
				]}
				actions={accion("cobrar")}
			/>

			<ListView
				title="Cuentas por pagar (proveedores)"
				endpoint="creditos/por-pagar"
				emptyText="Sin saldos por pagar."
				totalField="saldo"
				columns={[
					{ name: "proveedor", label: "Proveedor" },
					{ name: "numeroCompra", label: "Compra" },
					{ name: "montoTotal", label: "Monto", format: money },
					{ name: "saldo", label: "Saldo", format: money },
					{ name: "fechaVencimiento", label: "Vence", format: soloFecha },
				]}
				actions={accion("pagar")}
			/>

			<Modal show={!!abono} onHide={() => setAbono(null)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Registrar abono</h5>
					<button type="button" className="btn-close" onClick={() => setAbono(null)}></button>
				</div>
				<div className="modal-body">
					{abono && (
						<>
							<p className="mb-1">
								<strong>{abono.tipo === "cobrar" ? abono.row.cliente : abono.row.proveedor}</strong>
								{" · "}{abono.tipo === "cobrar" ? abono.row.numeroVenta : abono.row.numeroCompra}
							</p>
							<p className="mb-3">Saldo actual: <strong className="text-primary">{money(abono.row.saldo)}</strong></p>
							<label className="form-label">Monto a abonar (Q)</label>
							<input type="number" step="0.01" min="0.01" max={abono.row.saldo}
								className="form-control" value={monto} autoFocus
								onChange={(e) => setMonto(e.target.value)} />
						</>
					)}
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" onClick={() => setAbono(null)}>Cancelar</button>
					<button type="button" className="btn btn-primary" disabled={guardando} onClick={registrarAbono}>
						{guardando ? "Guardando…" : "Abonar"}
					</button>
				</div>
			</Modal>
		</>
	);
};

export default Creditos;
