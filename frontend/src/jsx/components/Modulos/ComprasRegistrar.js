import React, { useState } from "react";
import swal from "sweetalert";
import axiosInstance from "../../../services/AxiosInstance";
import { money } from "./format";
import SearchSelect from "./SearchSelect";

const ComprasRegistrar = () => {
	const [proveedorOpt, setProveedorOpt] = useState(null);
	const [tipoPago, setTipoPago] = useState("CONTADO");
	const [prodOpt, setProdOpt] = useState(null);
	const [cantidad, setCantidad] = useState("");
	const [costo, setCosto] = useState("");
	const [items, setItems] = useState([]);
	const [montoPagado, setMontoPagado] = useState("");
	const [saving, setSaving] = useState(false);

	const agregarItem = () => {
		if (!prodOpt || !cantidad || !costo) {
			swal("Faltan datos", "Elige producto, cantidad y costo.", "warning"); return;
		}
		setItems([...items, {
			productoId: prodOpt.value, nombre: prodOpt.label,
			cantidad: Number(cantidad), costoUnitario: Number(costo),
		}]);
		setProdOpt(null); setCantidad(""); setCosto("");
	};

	const total = items.reduce((s, it) => s + it.cantidad * it.costoUnitario, 0);

	const registrar = async () => {
		if (!proveedorOpt) { swal("Falta proveedor", "Selecciona un proveedor.", "warning"); return; }
		if (items.length === 0) { swal("Sin productos", "Agrega al menos un producto.", "warning"); return; }
		const pagado = montoPagado === "" ? total : Number(montoPagado);
		setSaving(true);
		try {
			await axiosInstance.post("/compras", {
				proveedorId: proveedorOpt.value, tipoPago, montoPagado: pagado,
				items: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad, costoUnitario: it.costoUnitario })),
			});
			const saldo = Math.max(total - pagado, 0);
			swal("Compra registrada",
				saldo > 0 ? `Inventario actualizado. Quedó Q${saldo.toFixed(2)} a crédito.` : "El inventario se actualizó (entrada de stock).",
				"success");
			setItems([]); setProveedorOpt(null); setMontoPagado("");
		} catch (err) {
			const msg = err?.response?.data?.message;
			swal("Error", Array.isArray(msg) ? msg.join("\n") : (msg || "No se pudo registrar."), "error");
		} finally { setSaving(false); }
	};

	return (
		<div className="card">
			<div className="card-header"><h4 className="card-title mb-0">Registrar compra (entrada de inventario)</h4></div>
			<div className="card-body">
				<div className="row">
					<div className="col-md-8 mb-3">
						<label className="form-label">Proveedor</label>
						<SearchSelect endpoint="proveedores" value={proveedorOpt}
							placeholder="Buscar proveedor…" onChange={setProveedorOpt} />
					</div>
					<div className="col-md-4 mb-3">
						<label className="form-label">Tipo de pago</label>
						<select className="form-control" value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
							<option value="CONTADO">Contado</option>
							<option value="CREDITO">Crédito</option>
						</select>
					</div>
				</div>

				<div className="row align-items-end">
					<div className="col-md-5 mb-2">
						<label className="form-label">Producto</label>
						<SearchSelect endpoint="productos" value={prodOpt}
							placeholder="Buscar producto…"
							getLabel={(p) => `${p.nombre}${p.codigoBarras ? ` · ${p.codigoBarras}` : ""}`}
							onChange={setProdOpt} />
					</div>
					<div className="col-md-3 mb-2">
						<label className="form-label">Cantidad</label>
						<input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
					</div>
					<div className="col-md-3 mb-2">
						<label className="form-label">Costo unitario (Q)</label>
						<input type="number" step="0.01" className="form-control" value={costo} onChange={(e) => setCosto(e.target.value)} />
					</div>
					<div className="col-md-1 mb-2">
						<button className="btn btn-outline-primary w-100" onClick={agregarItem}><i className="bi bi-plus-lg"></i></button>
					</div>
				</div>

				{items.length > 0 && (
					<table className="table table-sm mt-3">
						<thead><tr><th>Producto</th><th className="text-center">Cantidad</th><th className="text-end">Costo</th><th className="text-end">Subtotal</th><th></th></tr></thead>
						<tbody>
							{items.map((it, i) => (
								<tr key={i}>
									<td>{it.nombre}</td>
									<td className="text-center">{it.cantidad}</td>
									<td className="text-end">{money(it.costoUnitario)}</td>
									<td className="text-end">{money(it.cantidad * it.costoUnitario)}</td>
									<td className="text-end">
										<button className="btn btn-sm btn-danger light" onClick={() => setItems(items.filter((_, j) => j !== i))}>
											<i className="bi bi-trash"></i>
										</button>
									</td>
								</tr>
							))}
						</tbody>
						<tfoot><tr className="fw-bold"><td colSpan={3}>Total</td><td className="text-end text-primary">{money(total)}</td><td></td></tr></tfoot>
					</table>
				)}

				{items.length > 0 && (
					<div className="row align-items-end mt-2">
						<div className="col-md-4 mb-2">
							<label className="form-label">Pago inmediato (Q)</label>
							<input type="number" step="0.01" className="form-control"
								placeholder={total.toFixed(2)} value={montoPagado}
								onChange={(e) => setMontoPagado(e.target.value)} />
							<small className="text-muted">Vacío = pagar todo ({money(total)}).</small>
						</div>
						<div className="col-md-4 mb-2">
							<div className="alert alert-info py-2 mb-0">
								A crédito: <strong>{money(Math.max(total - (montoPagado === "" ? total : Number(montoPagado)), 0))}</strong>
							</div>
						</div>
					</div>
				)}
				<button className="btn btn-primary mt-2" disabled={saving} onClick={registrar}>
					{saving ? "Registrando…" : "Registrar compra"}
				</button>
			</div>
		</div>
	);
};

export default ComprasRegistrar;
