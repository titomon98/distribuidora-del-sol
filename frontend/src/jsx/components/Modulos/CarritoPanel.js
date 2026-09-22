import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import { money } from "./format";
import { imprimirRecibo } from "./recibo";
import SearchSelect from "./SearchSelect";
import axiosInstance from "../../../services/AxiosInstance";

const labelCliente = (c) => `${c.nombre}${c.nit ? ` (${c.nit})` : ""}`;

/** Tabla del carrito + resumen (cliente, método de pago, total, cobrar) + recibo. */
const CarritoPanel = ({ carrito }) => {
	const { items, clienteId, setClienteId, descuento, setDescuento, pagos, agregarPago, quitarPago, actualizarPago, cobrando, recibo, setRecibo,
		subtotal, total, unidades, cambiarCantidad, setCantidad, quitar, vaciar, cobrar } = carrito;

	const [clienteOpt, setClienteOpt] = useState(null);
	// Al reiniciarse la venta (cobro) vuelve a Consumidor Final.
	useEffect(() => { if (!clienteId) setClienteOpt(null); }, [clienteId]);

	// Alta rápida de cliente desde la venta.
	const [showCliente, setShowCliente] = useState(false);
	const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", nit: "", telefono: "" });
	const [guardandoCliente, setGuardandoCliente] = useState(false);

	const guardarCliente = async (e) => {
		e.preventDefault();
		if (!nuevoCliente.nombre.trim()) { swal("Falta el nombre", "El nombre es obligatorio.", "warning"); return; }
		setGuardandoCliente(true);
		try {
			const payload = { nombre: nuevoCliente.nombre.trim() };
			if (nuevoCliente.nit.trim()) payload.nit = nuevoCliente.nit.trim();
			if (nuevoCliente.telefono.trim()) payload.telefono = nuevoCliente.telefono.trim();
			const { data } = await axiosInstance.post("/clientes", payload);
			const opt = { value: data.id, label: labelCliente(data), raw: data };
			setClienteOpt(opt); setClienteId(data.id); // queda seleccionado
			setShowCliente(false);
			setNuevoCliente({ nombre: "", nit: "", telefono: "" });
		} catch (err) {
			const msg = err?.response?.data?.message;
			swal("Error", Array.isArray(msg) ? msg.join("\n") : (msg || "No se pudo guardar."), "error");
		} finally {
			setGuardandoCliente(false);
		}
	};

	const sumaPagos = pagos.reduce((s, p) => s + (p.monto === "" ? 0 : Number(p.monto)), 0);
	const hayBlanco = pagos.some((p) => p.monto === "");
	// Con un solo método basta; con varios, o si escribió montos, deben cuadrar.
	const cuadra = pagos.length === 1 || hayBlanco || Math.abs(sumaPagos - total) < 0.01;

	return (
		<>
			<div className="col-xl-8">
				<div className="card">
					<div className="card-header"><h4 className="card-title">Carrito</h4></div>
					<div className="card-body">
						<div className="table-responsive">
							<table className="table table-striped verticle-middle">
								<thead>
									<tr>
										<th>Producto</th><th className="text-end">Precio</th>
										<th className="text-center">Cantidad</th><th className="text-end">Subtotal</th><th></th>
									</tr>
								</thead>
								<tbody>
									{items.length === 0 && (
										<tr><td colSpan={5} className="text-center text-muted py-4">Agregue productos para vender.</td></tr>
									)}
									{items.map((it) => (
										<tr key={it.id}>
											<td>{it.nombre}</td>
											<td className="text-end">{money(it.precio)}</td>
											<td className="text-center">
												<div className="input-group input-group-sm flex-nowrap" style={{ width: 130, margin: "0 auto" }}>
													<button className="btn btn-outline-primary px-2" type="button" onClick={() => cambiarCantidad(it.id, -1)}>−</button>
													<input type="number" min="1" className="form-control text-center px-1"
														value={it.cantidad} onChange={(e) => setCantidad(it.id, e.target.value)} />
													<button className="btn btn-outline-primary px-2" type="button" onClick={() => cambiarCantidad(it.id, 1)}>+</button>
												</div>
											</td>
											<td className="text-end fw-bold">{money(it.precio * it.cantidad)}</td>
											<td className="text-end">
												<button className="btn btn-sm btn-danger light" onClick={() => quitar(it.id)}>
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

			<div className="col-xl-4">
				<div className="card">
					<div className="card-header"><h4 className="card-title">Resumen</h4></div>
					<div className="card-body">
						<div className="mb-3">
							<div className="d-flex justify-content-between align-items-center mb-1">
								<label className="form-label mb-0">Cliente</label>
								<button type="button" className="btn btn-sm btn-outline-primary py-0 px-2"
									onClick={() => setShowCliente(true)}>
									<i className="bi bi-plus-lg"></i> Nuevo cliente
								</button>
							</div>
							<SearchSelect endpoint="clientes" value={clienteOpt}
								placeholder="Consumidor Final (buscar cliente)"
								getLabel={labelCliente}
								onChange={(o) => { setClienteOpt(o); setClienteId(o?.value || ""); }} />
						</div>
						<div className="d-flex justify-content-between mb-2"><span>Artículos</span><span>{items.length}</span></div>
						<div className="d-flex justify-content-between mb-2"><span>Unidades</span><span>{unidades}</span></div>
						<hr />
						<div className="d-flex justify-content-between align-items-center mb-2">
							<label className="form-label mb-0">Pago(s)</label>
							<button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={agregarPago}>
								<i className="bi bi-plus-lg"></i> Agregar método de pago
							</button>
						</div>
						{pagos.map((p, i) => (
							<div className="d-flex gap-1 mb-2" key={i}>
								<select className="form-control form-control-sm" value={p.metodoPago}
									onChange={(e) => actualizarPago(i, "metodoPago", e.target.value)}>
									<option value="EFECTIVO">Efectivo</option>
									<option value="TARJETA">Tarjeta</option>
									<option value="TRANSFERENCIA">Transferencia</option>
								</select>
								<input type="number" step="0.01" className="form-control form-control-sm"
									style={{ maxWidth: 110 }} placeholder={pagos.length === 1 ? total.toFixed(2) : "monto"}
									value={p.monto} onChange={(e) => actualizarPago(i, "monto", e.target.value)} />
								{pagos.length > 1 && (
									<button className="btn btn-sm btn-danger light py-0 px-2" onClick={() => quitarPago(i)}>
										<i className="bi bi-x"></i>
									</button>
								)}
							</div>
						))}
						{pagos.length > 1 && (
							<div className={`small mb-2 ${cuadra ? "text-muted" : "text-danger"}`}>
								Suma pagos: {money(sumaPagos)} / Total: {money(total)}
							</div>
						)}
						<div className="d-flex justify-content-between align-items-center mb-2">
							<span>Subtotal</span><span>{money(subtotal)}</span>
						</div>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<label className="mb-0">Descuento (Q)</label>
							<input type="number" step="0.01" min="0" className="form-control form-control-sm"
								style={{ maxWidth: 110 }} value={descuento} placeholder="0.00"
								onChange={(e) => setDescuento(e.target.value)} />
						</div>
						<div className="d-flex justify-content-between mb-3">
							<h4 className="mb-0">Total</h4><h3 className="mb-0 text-primary">{money(total)}</h3>
						</div>
						<button className="btn btn-primary btn-block" disabled={items.length === 0 || cobrando || !cuadra}
							onClick={() => cobrar((m) => swal("No se pudo cobrar", m, "error"))}>
							{cobrando ? "Cobrando…" : "Cobrar"}
						</button>
						<button className="btn btn-outline-danger btn-block mt-2" disabled={items.length === 0} onClick={vaciar}>
							Vaciar
						</button>
					</div>
				</div>
			</div>

			<Modal show={showCliente} onHide={() => setShowCliente(false)} centered>
				<form onSubmit={guardarCliente}>
					<div className="modal-header">
						<h5 className="modal-title">Nuevo cliente</h5>
						<button type="button" className="btn-close" onClick={() => setShowCliente(false)}></button>
					</div>
					<div className="modal-body">
						<div className="mb-3">
							<label className="form-label">Nombre<span className="text-danger"> *</span></label>
							<input type="text" className="form-control" autoFocus value={nuevoCliente.nombre}
								onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })} />
						</div>
						<div className="mb-3">
							<label className="form-label">NIT</label>
							<input type="text" className="form-control" value={nuevoCliente.nit}
								onChange={(e) => setNuevoCliente({ ...nuevoCliente, nit: e.target.value })} />
						</div>
						<div className="mb-3">
							<label className="form-label">Teléfono</label>
							<input type="text" className="form-control" value={nuevoCliente.telefono}
								onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })} />
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" onClick={() => setShowCliente(false)}>Cancelar</button>
						<button type="submit" className="btn btn-primary" disabled={guardandoCliente}>
							{guardandoCliente ? "Guardando…" : "Guardar y seleccionar"}
						</button>
					</div>
				</form>
			</Modal>

			<Modal show={!!recibo} onHide={() => setRecibo(null)} centered>
				<div className="modal-header">
					<h5 className="modal-title">Venta registrada</h5>
					<button type="button" className="btn-close" onClick={() => setRecibo(null)}></button>
				</div>
				<div className="modal-body">
					{recibo && (
						<>
							<div className="alert alert-success py-2">
								No. <strong>{recibo.numeroVenta || recibo.numero_venta}</strong> · enviada a despacho.
							</div>
							<table className="table table-sm mb-0">
								<tbody>
									{(recibo.items || []).map((it, i) => (
										<tr key={i}><td>{it.cantidad} × {it.producto}</td><td className="text-end">{money(it.subtotal)}</td></tr>
									))}
								</tbody>
								<tfoot><tr className="fw-bold"><td>Total</td><td className="text-end text-primary">{money(recibo.total)}</td></tr></tfoot>
							</table>
						</>
					)}
				</div>
				<div className="modal-footer">
					<button type="button" className="btn btn-secondary" onClick={() => setRecibo(null)}>Cerrar</button>
					<button type="button" className="btn btn-primary" onClick={() => imprimirRecibo(recibo)}>
						<i className="bi bi-printer me-1"></i>Imprimir recibo
					</button>
				</div>
			</Modal>
		</>
	);
};

export default CarritoPanel;
