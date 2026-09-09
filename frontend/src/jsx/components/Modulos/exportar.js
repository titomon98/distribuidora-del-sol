import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Exporta una tabla (headers + filas) a un archivo .xlsx. */
export function exportarExcel(nombre, headers, filas) {
	const ws = XLSX.utils.aoa_to_sheet([headers, ...filas]);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "Reporte");
	XLSX.writeFile(wb, `${nombre}.xlsx`);
}

/** Exporta una tabla a un archivo .pdf con título y encabezado. */
export function exportarPdf(nombre, titulo, headers, filas) {
	const doc = new jsPDF();
	doc.setFontSize(14);
	doc.text(titulo, 14, 16);
	autoTable(doc, {
		head: [headers],
		body: filas,
		startY: 22,
		styles: { fontSize: 8 },
		headStyles: { fillColor: [209, 143, 44] }, // Egg Yellow
	});
	doc.save(`${nombre}.pdf`);
}
