import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../images/logo-full.jpeg"; // logo oficial del cliente (>10KB, no se inlina)

/** Exporta una tabla (headers + filas) a un archivo .xlsx. */
export function exportarExcel(nombre, headers, filas) {
	const ws = XLSX.utils.aoa_to_sheet([headers, ...filas]);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Reporte");
	XLSX.writeFile(wb, `${nombre}.xlsx`);
}

// Carga el logo una sola vez como HTMLImageElement (jsPDF lo dibuja directo).
let logoImg;
function cargarLogo() {
	if (logoImg) return Promise.resolve(logoImg);
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => { logoImg = img; resolve(img); };
		img.onerror = () => resolve(null);
		img.src = logo;
	});
}

/** Exporta una tabla a un archivo .pdf con título y encabezado (logo del cliente). */
export async function exportarPdf(nombre, titulo, headers, filas) {
	const doc = new jsPDF();
	const img = await cargarLogo();
	if (img) doc.addImage(img, "JPEG", 14, 8, 22, 22); // logo cuadrado, esquina superior izquierda
	doc.setFontSize(14);
	doc.text(titulo, 40, 22);
	autoTable(doc, {
		head: [headers],
		body: filas,
		startY: 36,
		styles: { fontSize: 8 },
		headStyles: { fillColor: [209, 143, 44] }, // Egg Yellow
	});
	doc.save(`${nombre}.pdf`);
}
