import React from "react";

/**
 * Controles de paginación en cliente reutilizables (tablas CRUD y de datos).
 * props: total, page (1-based), pageSize, onPage(n), onPageSize(n).
 */
const OPCIONES = [25, 50, 100];

const Paginacion = ({ total, page, pageSize, onPage, onPageSize }) => {
	const paginas = Math.max(1, Math.ceil(total / pageSize));
	const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const hasta = Math.min(page * pageSize, total);

	return (
		<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
			<div className="d-flex align-items-center gap-2">
				<span className="text-muted small">Mostrando {desde}-{hasta} de {total}</span>
				<select className="form-control form-control-sm" style={{ width: 90 }}
					value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
					{OPCIONES.map((n) => <option key={n} value={n}>{n} / pág.</option>)}
				</select>
			</div>
			<div className="btn-group btn-group-sm">
				<button className="btn btn-outline-primary" disabled={page <= 1} onClick={() => onPage(1)}>«</button>
				<button className="btn btn-outline-primary" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
				<button className="btn btn-outline-primary disabled" style={{ pointerEvents: "none" }}>
					Página {page} de {paginas}
				</button>
				<button className="btn btn-outline-primary" disabled={page >= paginas} onClick={() => onPage(page + 1)}>›</button>
				<button className="btn btn-outline-primary" disabled={page >= paginas} onClick={() => onPage(paginas)}>»</button>
			</div>
		</div>
	);
};

export default Paginacion;
