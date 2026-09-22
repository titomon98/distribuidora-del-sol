import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";
import { useCarrito } from "./useCarrito";
import CarritoPanel from "./CarritoPanel";
import { money } from "./format";

/**
 * Punto de cobro MANUAL (sin pistola): busca el producto por nombre o código
 * contra el backend (con debounce, sin precargar) y lo agrega al carrito.
 */
const VentaManual = () => {
	const carrito = useCarrito();
	const [q, setQ] = useState("");
	const [resultados, setResultados] = useState([]);
	const [buscando, setBuscando] = useState(false);
	const timer = useRef(null);

	useEffect(() => {
		if (!q.trim()) { setResultados([]); return; }
		setBuscando(true);
		clearTimeout(timer.current);
		timer.current = setTimeout(async () => {
			try {
				const { data } = await axiosInstance.get(`/productos?search=${encodeURIComponent(q.trim())}`);
				setResultados(data);
			} catch { setResultados([]); }
			finally { setBuscando(false); }
		}, 300);
		return () => clearTimeout(timer.current);
	}, [q]);

	return (
		<>
			<div className="card">
				<div className="card-header">
					<h4 className="card-title"><i className="bi bi-search me-2"></i>Venta manual (búsqueda)</h4>
				</div>
				<div className="card-body">
					<label className="form-label fw-bold">Buscar producto por nombre o código</label>
					<input type="text" className="form-control form-control-lg" placeholder="Escriba para buscar…"
						value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
					{q.trim() && (
						<div className="list-group mt-2">
							{buscando && <div className="list-group-item text-muted">Buscando…</div>}
							{!buscando && resultados.length === 0 && <div className="list-group-item text-muted">Sin coincidencias.</div>}
							{!buscando && resultados.map((p) => (
								<button key={p.id} type="button"
									className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
									onClick={() => { carrito.agregar(p); setQ(""); }}>
									<span>{p.nombre} <small className="text-muted">{p.codigoBarras || ""}</small></span>
									<span className="text-primary fw-bold">{money(p.precioVenta)}</span>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
			<div className="row">
				<CarritoPanel carrito={carrito} />
			</div>
		</>
	);
};

export default VentaManual;
