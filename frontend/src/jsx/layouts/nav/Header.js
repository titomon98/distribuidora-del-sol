import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutPage from './Logout';

const Header = () => {
	const [headerFix, setheaderFix] = useState(false);

	// Nombre del usuario actualmente logueado (viene del backend en el login).
	const displayName = useSelector(
		(state) => state.auth.auth.displayName || state.auth.auth.username || 'Usuario',
	);

	useEffect(() => {
		window.addEventListener("scroll", () => {
			setheaderFix(window.scrollY > 50);
		});
	}, []);

	return (
		<div className={`header ${headerFix ? "is-fixed" : ""}`}>
			<div className="header-content">
				<nav className="navbar navbar-expand">
					<div className="container d-block my-0">
						<div className="d-flex align-items-center justify-content-end">
							<ul className="navbar-nav header-right">
								<li>
									<Dropdown className="header-profile2">
										<Dropdown.Toggle as="a" className="nav-link i-false cursor-pointer" id="droptoggle1">
											<div className="header-info2 d-flex align-items-center">
												<div className="d-flex align-items-center sidebar-info">
													<div>
														<h6 className="font-w500 mb-0 ms-2">{displayName}</h6>
													</div>
													<i className="fas fa-chevron-down ms-2"></i>
												</div>
											</div>
										</Dropdown.Toggle>
										<Dropdown.Menu className="dropdown-menu-end">
											<Link to="/mi-cuenta" className="dropdown-item ai-icon">
												<i className="bi bi-gear text-primary"></i>
												<span className="ms-2">Mi cuenta</span>
											</Link>
											<LogoutPage />
										</Dropdown.Menu>
									</Dropdown>
								</li>
							</ul>
						</div>
					</div>
				</nav>
			</div>
		</div>
	);
};

export default Header;
