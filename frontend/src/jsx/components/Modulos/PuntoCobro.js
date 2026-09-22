import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";
import { getSocket } from "../../../services/socket";
import { useCarrito } from "./useCarrito";
import CarritoPanel from "./CarritoPanel";

/**
 * Punto de cobro con pistola de código de barras. La pistola actúa como teclado
 * (código + Enter); el input mantiene el foco para escanear en cadena.
 */
const PuntoCobro = () => {
	const carrito = useCarrito();
	const [codigo, setCodigo] = useState("");
	const [aviso, setAviso] = useState(null);
	const inputRef = useRef(null);
	const focus = () => inputRef.current && inputRef.current.focus();

	useEffect(() => { focus(); }, []);

	// Tiempo real: cuando despacho confirma un pedido, avisa en caja.
	useEffect(() => {
		const s = getSocket();
		const onDespachada = () => setAviso({ tipo: "info", texto: "Despacho confirmó un pedido" });
		s.on("venta:despachada", onDespachada);
		return () => s.off("venta:despachada", onDespachada);
	}, []);

	const escanear = async (e) => {
		if (e.key !== "Enter" && e.keyCode !== 13 && e.which !== 13) return;
		e.preventDefault();
		// Leer el valor real del input (no el estado): una pistola teclea muy
		// rápido y el estado de React puede llegar desactualizado al Enter.
		const code = (e.target.value || codigo).trim();
		setCodigo("");
		if (!code) return;
		try {
			const { data } = await axiosInstance.get(`/productos/barcode/${encodeURIComponent(code)}`);
			const res = carrito.agregar(data);
			if (res.ok) {
				setAviso({ tipo: "success", texto: `Agregado: ${data.nombre}` });
			} else {
				setAviso({ tipo: "danger", texto: `${data.nombre}: sin existencia suficiente (disponible ${res.stock})` });
			}
		} catch (err) {
			const msg = err?.response?.data?.message || "Producto no encontrado";
			setAviso({ tipo: "danger", texto: `${code}: ${msg}` });
		}
		focus();
	};

	return (
		<>
			<div className="card">
				<div className="card-header">
					<h4 className="card-title"><i className="bi bi-upc-scan me-2"></i>Punto de cobro (escáner)</h4>
				</div>
				<div className="card-body">
					<label className="form-label fw-bold">Escanea el código de barras</label>
					<input ref={inputRef} type="text" inputMode="numeric" autoComplete="off"
						className="form-control form-control-lg" placeholder="Apunta la pistola y cobra…"
						value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={escanear} />
					{aviso && <div className={`alert alert-${aviso.tipo} mt-3 mb-0 py-2`}>{aviso.texto}</div>}
				</div>
			</div>
			<div className="row">
				<CarritoPanel carrito={carrito} />
			</div>
		</>
	);
};

export default PuntoCobro;
