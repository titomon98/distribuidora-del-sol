import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../images/logo-full.png"; // <10KB -> CRA lo inlina como data URL

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
	// Encabezado: logo (204x45) en la esquina superior izquierda.
	doc.addImage(logo, "PNG", 14, 10, 40, 40 * 45 / 204);
	doc.setFontSize(14);
	doc.text(titulo, 14, 34);
	autoTable(doc, {
		head: [headers],
		body: filas,
		startY: 40,
		styles: { fontSize: 8 },
		headStyles: { fillColor: [209, 143, 44] }, // Egg Yellow
	});
	doc.save(`${nombre}.pdf`);
}
