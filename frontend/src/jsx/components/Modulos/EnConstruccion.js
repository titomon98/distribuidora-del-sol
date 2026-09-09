import React from "react";

/**
 * Página placeholder para módulos cuyo backend/pantalla aún se está construyendo.
 * Reutiliza la card de la plantilla. Se reemplaza por el módulo real conforme se
 * implementa cada uno contra la API NestJS.
 */
const EnConstruccion = ({ titulo = "Módulo", descripcion }) => {
	return (
		<div className="row">
			<div className="col-xl-12">
				<div className="card">
					<div className="card-header">
						<h4 className="card-title">{titulo}</h4>
					</div>
					<div className="card-body text-center py-5">
						<i className="bi bi-cone-striped" style={{ fontSize: "3rem", color: "var(--primary)" }}></i>
						<h3 className="mt-3">En construcción</h3>
						<p className="text-muted mb-0">
							{descripcion || `El módulo de ${titulo.toLowerCase()} se conectará con la API en la siguiente iteración.`}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EnConstruccion;
