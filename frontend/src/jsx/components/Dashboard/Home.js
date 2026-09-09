import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from "../../../context/ThemeContext";
import axiosInstance from '../../../services/AxiosInstance';
import { getSocket } from '../../../services/socket';

const money = (n) =>
	'Q ' + Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const StatCard = ({ icon, titulo, valor, sub }) => (
	<div className="col-xl-3 col-sm-6">
		<div className="card">
			<div className="card-body d-flex align-items-center">
				<span className="me-3 d-inline-flex align-items-center justify-content-center rounded-circle"
					style={{ width: 56, height: 56, background: "var(--rgba-primary-1, rgba(209,143,44,.15))" }}>
					<i className={icon} style={{ fontSize: "1.6rem", color: "var(--primary)" }}></i>
				</span>
				<div>
					<h3 className="mb-0 font-w600">{valor}</h3>
					<span className="text-muted">{titulo}</span>
					{sub && <div className="fs-13 text-primary">{sub}</div>}
				</div>
			</div>
		</div>
	</div>
);

const Home = () => {
	const { changeBackground } = useContext(ThemeContext);
	const [data, setData] = useState(null);
	const [error, setError] = useState('');

	const cargar = useCallback(() => {
		axiosInstance.get('/dashboard/resumen')
			.then((res) => setData(res.data))
			.catch(() => setError('No se pudo cargar el resumen del día.'));
	}, []);

	useEffect(() => {
		changeBackground({ value: "light", label: "Light" });
		cargar();
		// Tiempo real: refresca el resumen ante ventas nuevas / despachadas.
		const s = getSocket();
		s.on('venta:nueva', cargar);
		s.on('venta:despachada', cargar);
		return () => { s.off('venta:nueva', cargar); s.off('venta:despachada', cargar); };
	}, [cargar]); // eslint-disable-line react-hooks/exhaustive-deps

	const r = data || {
		ventasHoy: { total: 0, cantidad: 0 },
		despachadasHoy: 0,
		pendientesHoy: 0,
		productosMasVendidos: [],
		alertasStock: { bajo: 0, agotado: 0 },
	};
	const al = r.alertasStock || { bajo: 0, agotado: 0 };

	return (
		<>
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h3 className="mb-0">Resumen del día</h3>
			</div>

			{error && <div className="alert alert-warning">{error}</div>}

			{(al.agotado > 0 || al.bajo > 0) && (
				<div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap">
					<span>
						<i className="bi bi-exclamation-triangle me-2"></i>
						Alertas de inventario: <strong>{al.agotado}</strong> agotado(s) y <strong>{al.bajo}</strong> con stock bajo.
					</span>
					<Link to="/inventario" className="btn btn-sm btn-warning">Ver inventario</Link>
				</div>
			)}

			<div className="row">
				<StatCard icon="bi bi-cash-stack" titulo="Ventas de hoy" valor={money(r.ventasHoy.total)}
					sub={`${r.ventasHoy.cantidad} venta(s)`} />
				<StatCard icon="bi bi-box-seam" titulo="Pedidos despachados" valor={r.despachadasHoy} />
				<StatCard icon="bi bi-hourglass" titulo="Pedidos pendientes" valor={r.pendientesHoy} />
				<StatCard icon="bi bi-receipt" titulo="Pedidos de hoy"
					valor={r.despachadasHoy + r.pendientesHoy} />
			</div>

			<div className="row">
				<div className="col-xl-12">
					<div className="card">
						<div className="card-header border-0">
							<h4 className="card-title">Productos más vendidos</h4>
						</div>
						<div className="card-body pt-0">
							<div className="table-responsive">
								<table className="table table-striped mb-0">
									<thead>
										<tr>
											<th style={{ width: 60 }}>#</th>
											<th>Producto</th>
											<th className="text-end">Unidades vendidas</th>
										</tr>
									</thead>
									<tbody>
										{r.productosMasVendidos.length === 0 && (
											<tr><td colSpan={3} className="text-center text-muted py-4">
												Aún no hay ventas registradas.
											</td></tr>
										)}
										{r.productosMasVendidos.map((p, i) => (
											<tr key={i}>
												<td>{i + 1}</td>
												<td>{p.nombre}</td>
												<td className="text-end font-w600">{p.cantidad}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Home;
