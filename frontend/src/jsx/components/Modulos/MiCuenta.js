import React, { useState } from "react";
import swal from "sweetalert";
import axiosInstance from "../../../services/AxiosInstance";

const MiCuenta = () => {
	const [actual, setActual] = useState("");
	const [nueva, setNueva] = useState("");
	const [confirmar, setConfirmar] = useState("");
	const [guardando, setGuardando] = useState(false);

	const nombre = (() => {
		try { return (JSON.parse(localStorage.getItem("userDetails") || "{}")).displayName || ""; }
		catch { return ""; }
	})();

	const guardar = async (e) => {
		e.preventDefault();
		if (nueva.length < 4) { swal("Contraseña corta", "Mínimo 4 caracteres.", "warning"); return; }
		if (nueva !== confirmar) { swal("No coincide", "La confirmación no coincide.", "warning"); return; }
		setGuardando(true);
		try {
			await axiosInstance.patch("/usuarios/me/password", { actual, nueva });
			swal("Listo", "Tu contraseña se actualizó.", "success");
			setActual(""); setNueva(""); setConfirmar("");
		} catch (err) {
			swal("Error", err?.response?.data?.message || "No se pudo cambiar.", "error");
		} finally { setGuardando(false); }
	};

	return (
		<div className="row justify-content-center">
			<div className="col-lg-6">
				<div className="card">
					<div className="card-header"><h4 className="card-title mb-0">Mi cuenta{nombre ? ` — ${nombre}` : ""}</h4></div>
					<div className="card-body">
						<form onSubmit={guardar}>
							<div className="mb-3">
								<label className="form-label">Contraseña actual</label>
								<input type="password" className="form-control" value={actual} autoComplete="current-password"
									onChange={(e) => setActual(e.target.value)} required />
							</div>
							<div className="mb-3">
								<label className="form-label">Nueva contraseña</label>
								<input type="password" className="form-control" value={nueva} autoComplete="new-password"
									onChange={(e) => setNueva(e.target.value)} required />
							</div>
							<div className="mb-3">
								<label className="form-label">Confirmar nueva contraseña</label>
								<input type="password" className="form-control" value={confirmar} autoComplete="new-password"
									onChange={(e) => setConfirmar(e.target.value)} required />
							</div>
							<button type="submit" className="btn btn-primary" disabled={guardando}>
								{guardando ? "Guardando…" : "Cambiar contraseña"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MiCuenta;
