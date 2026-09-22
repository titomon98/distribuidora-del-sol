import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import ListView from "./ListView";
import axiosInstance from "../../../services/AxiosInstance";
import { money, fechaCorta } from "./format";


/** Cuentas por pagar (créditos de proveedores) + abonos. */
const CreditosProveedores = () => {
	const [abono, setAbono] = useState(null); // { row, reload }
	const [monto, setMonto] = useState("");
	const [guardando, setGuardando] = useState(false);

	const abrir = (row, reload) => { setAbono({ row, reload }); setMonto(""); };

	const registrarAbono = async () => {
		const m = Number(monto);
		if (!m || m <= 0) { swal("Monto inválido", "Ingrese un monto mayor a 0.", "warning"); return; }
		setGuardando(true);
		try {
			await axiosInstance.post(`/creditos/por-pagar/${abono.row.id}/abono`, { monto: m });
			const reload = abono.reload;
			setAbono(null);
			await reload();
		} catch (err) {
			swal("Error", err?.response?.data?.message || "No se pudo abonar.", "error");
		} finally { setGuardando(false); }
	};

	return (
		<>
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
					{ name: "fechaVencimiento", label: "Vence", format: fechaCorta },
				]}
				actions={(row, reload) => (
					<button className="btn btn-sm btn-primary" onClick={() => abrir(row, reload)}>
						<i className="bi bi-cash-stack me-1"></i>Abonar
					</button>
				)}
			/>

			<Modal show={!!abono} onHide={() => setAbono(null)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Registrar abono a proveedor</h5>
					<button type="button" className="btn-close" onClick={() => setAbono(null)}></button>
				</div>
				<div className="modal-body">
					{abono && (
						<>
							<p className="mb-1"><strong>{abono.row.proveedor}</strong> · {abono.row.numeroCompra}</p>
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

export default CreditosProveedores;
