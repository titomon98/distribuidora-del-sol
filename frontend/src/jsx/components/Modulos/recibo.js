// Genera e imprime un recibo/ticket interno (NO fiscal) de una venta.
import { fecha as fmtFecha } from "./format";

const q = (n) =>
	"Q " + Number(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Sello fecha-hora para el nombre de archivo (YYYYMMDD-HHMMSS), evita duplicados.
const selloArchivo = (v) => {
	const d = new Date(v || Date.now());
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

/** Construye el HTML del ticket (formato angosto tipo impresora de punto de venta). */
export function reciboHtml(venta) {
	const items = venta.items || [];
	const numero = venta.numeroVenta || venta.numero_venta || "";
	const metodo = venta.metodoPago || venta.metodo_pago || "";
	const fecha = fmtFecha(venta.fecha || Date.now());
	// nombre-archivo-fecha-hora: es el nombre por defecto al "Guardar como PDF".
	const nombreArchivo = `recibo-${numero || "venta"}-${selloArchivo(venta.fecha)}`;
	const filas = items.map((it) => `
		<tr>
			<td class="l">${it.cantidad} x ${it.producto}</td>
			<td class="r">${q(it.subtotal)}</td>
		</tr>`).join("");

	const pagos = venta.pagos || [];
	const filasPagos = pagos.length
		? `<hr><table>${pagos.map((p) => `<tr><td class="l">${p.metodoPago}</td><td class="r">${q(p.monto)}</td></tr>`).join("")}</table>`
		: "";

	return `<!doctype html><html lang="es"><head><meta charset="utf-8">
	<title>${nombreArchivo}</title>
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
		${Number(venta.descuento) > 0 ? `<table>
			<tr><td class="l">Subtotal</td><td class="r">${q(venta.subtotal)}</td></tr>
			<tr><td class="l">Descuento</td><td class="r">-${q(venta.descuento)}</td></tr>
		</table>` : ""}
		<table><tr><td class="l tot">TOTAL</td><td class="r tot">${q(venta.total)}</td></tr></table>
		${filasPagos}
		<div class="foot">¡Gracias por su compra!</div>
	</body></html>`;
}

/**
 * Imprime un HTML usando un iframe oculto (sin abrir ventana emergente).
 * Dispara el diálogo de impresión del navegador sobre el contenido dado.
 */
export function imprimirHtml(html) {
	const iframe = document.createElement("iframe");
	iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
	document.body.appendChild(iframe);
	const limpiar = () => setTimeout(() => document.body.removeChild(iframe), 1000);
	iframe.onload = () => {
		try {
			iframe.contentWindow.focus();
			iframe.contentWindow.print();
		} finally { limpiar(); }
	};
	const doc = iframe.contentWindow.document;
	doc.open(); doc.write(html); doc.close();
}

/** Imprime el recibo de una venta (vía iframe, sin ventana emergente). */
export function imprimirRecibo(venta) {
	imprimirHtml(reciboHtml(venta));
}
