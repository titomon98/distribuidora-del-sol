import { useRef, useState } from "react";
import axiosInstance from "../../../services/AxiosInstance";

const uuid = () =>
	(window.crypto && window.crypto.randomUUID)
		? window.crypto.randomUUID()
		: "k-" + Date.now() + "-" + Math.random().toString(16).slice(2);

/**
 * Lógica compartida del carrito de cobro (usada por el punto de cobro con
 * pistola y por la venta manual). Maneja items, método de pago, total, y el
 * cobro contra el backend con llave de idempotencia.
 */
export function useCarrito() {
	const [items, setItems] = useState([]); // { id, nombre, precio, cantidad }
	const [clienteId, setClienteId] = useState(""); // "" = Consumidor Final
	const [descuento, setDescuento] = useState("");
	const [pagos, setPagos] = useState([{ metodoPago: "EFECTIVO", monto: "" }]);
	const [cobrando, setCobrando] = useState(false);
	const [recibo, setRecibo] = useState(null);
	const idemKey = useRef(uuid());

	const agregarPago = () => setPagos((p) => [...p, { metodoPago: "TARJETA", monto: "" }]);
	const quitarPago = (i) => setPagos((p) => (p.length > 1 ? p.filter((_, j) => j !== i) : p));
	const actualizarPago = (i, campo, valor) =>
		setPagos((p) => p.map((x, j) => (j === i ? { ...x, [campo]: valor } : x)));

	const agregar = (producto) => {
		setItems((prev) => {
			const i = prev.findIndex((it) => it.id === producto.id);
			if (i >= 0) {
				const copy = [...prev];
				copy[i] = { ...copy[i], cantidad: copy[i].cantidad + 1 };
				return copy;
			}
			return [...prev, {
				id: producto.id,
				nombre: producto.nombre,
				precio: Number(producto.precioVenta),
				cantidad: 1,
			}];
		});
	};

	const cambiarCantidad = (id, delta) =>
		setItems((prev) => prev
			.map((it) => (it.id === id ? { ...it, cantidad: it.cantidad + delta } : it))
			.filter((it) => it.cantidad > 0));

	// Fija la cantidad manualmente (mínimo 1).
	const setCantidad = (id, valor) =>
		setItems((prev) => prev.map((it) => {
			if (it.id !== id) return it;
			const n = Math.max(1, parseInt(valor, 10) || 1);
			return { ...it, cantidad: n };
		}));

	const quitar = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
	const vaciar = () => setItems([]);

	const subtotal = items.reduce((s, it) => s + it.precio * it.cantidad, 0);
	const desc = Math.min(Math.max(Number(descuento) || 0, 0), subtotal);
	const total = +(subtotal - desc).toFixed(2); // total a pagar (con descuento)
	const unidades = items.reduce((s, it) => s + it.cantidad, 0);

	// Convierte las líneas de pago: la primera con monto vacío toma el restante.
	const construirPagos = () => {
		let restante = +total.toFixed(2);
		const provistos = pagos.map((p) => (p.monto === "" ? null : Number(p.monto)));
		const sumaProv = provistos.filter((v) => v != null).reduce((a, b) => a + b, 0);
		restante = +(total - sumaProv).toFixed(2);
		return pagos.map((p, i) => {
			let monto = provistos[i];
			if (monto == null) { monto = restante > 0 ? restante : 0; restante = 0; }
			return { metodoPago: p.metodoPago, monto };
		});
	};

	const cobrar = async (onError) => {
		if (items.length === 0 || cobrando) return;
		setCobrando(true);
		try {
			const { data } = await axiosInstance.post("/ventas", {
				...(clienteId ? { clienteId } : {}),
				descuento: desc,
				pagos: construirPagos(),
				items: items.map((it) => ({ productoId: it.id, cantidad: it.cantidad, precioUnitario: it.precio })),
			}, { headers: { "Idempotency-Key": idemKey.current } });
			setItems([]);
			setClienteId("");
			setDescuento("");
			setPagos([{ metodoPago: "EFECTIVO", monto: "" }]);
			setRecibo(data);
			idemKey.current = uuid();
		} catch (err) {
			const msg = err?.response?.data?.message;
			if (onError) onError(Array.isArray(msg) ? msg.join("\n") : (msg || "Error de conexión."));
		} finally {
			setCobrando(false);
		}
	};

	return {
		items, clienteId, setClienteId, descuento, setDescuento, pagos, agregarPago, quitarPago, actualizarPago,
		cobrando, recibo, setRecibo,
		subtotal, total, unidades, agregar, cambiarCantidad, setCantidad, quitar, vaciar, cobrar,
	};
}
