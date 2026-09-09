// Genera e imprime un recibo/ticket interno (NO fiscal) de una venta.
const q = (n) =>
	"Q " + Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Construye el HTML del ticket (formato angosto tipo impresora de punto de venta). */
export function reciboHtml(venta) {
	const items = venta.items || [];
	const numero = venta.numeroVenta || venta.numero_venta || "";
	const metodo = venta.metodoPago || venta.metodo_pago || "";
	const fecha = new Date(venta.fecha || Date.now()).toLocaleString("es-GT");
	const filas = items.map((it) => `
		<tr>
			<td class="l">${it.cantidad} x ${it.producto}</td>
			<td class="r">${q(it.subtotal)}</td>
		</tr>`).join("");

	return `<!doctype html><html lang="es"><head><meta charset="utf-8">
	<title>Recibo ${numero}</title>
	<style>
		* { font-family: 'Courier New', monospace; }
		body { width: 280px; margin: 0 auto; padding: 8px; color: #000; }
		h1 { font-size: 16px; text-align: center; margin: 4px 0; }
		.center { text-align: center; }
		.muted { font-size: 11px; }
		hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		td.l { text-align: left; } td.r { text-align: right; }
		.tot { font-size: 15px; font-weight: bold; }
		.foot { font-size: 11px; text-align: center; margin-top: 8px; }
	</style></head><body>
		<h1>Distribuidora del Sol</h1>
		<div class="center muted">Recibo interno de venta<br>(no es factura / comprobante fiscal)</div>
		<hr>
		<div class="muted">
			No.: ${numero}<br>
			Fecha: ${fecha}<br>
			Cliente: ${venta.cliente || "Consumidor Final"}<br>
			Cajero: ${venta.usuario || "-"}<br>
			Pago: ${metodo}
		</div>
		<hr>
		<table>${filas}</table>
		<hr>
		<table><tr><td class="l tot">TOTAL</td><td class="r tot">${q(venta.total)}</td></tr></table>
		<div class="foot">¡Gracias por su compra!</div>
	</body></html>`;
}

/** Abre el recibo en una ventana e invoca la impresión del navegador. */
export function imprimirRecibo(venta) {
	const w = window.open("", "_blank", "width=340,height=600");
	if (!w) return;
	w.document.write(reciboHtml(venta));
	w.document.close();
	w.focus();
	w.onload = () => { w.print(); };
	// fallback si onload no dispara
	setTimeout(() => { try { w.print(); } catch { /* noop */ } }, 400);
}
