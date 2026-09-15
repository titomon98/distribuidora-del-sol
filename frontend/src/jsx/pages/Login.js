import React, { useState } from 'react'
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { loadingToggleAction,loginAction,
} from '../../store/actions/AuthActions';

//

import logo from '../../images/logo-full-transparent.png'

function Login (props) {
	const navigate = useNavigate();
    const [email, setEmail] = useState('');
    let errorsObj = { email: '', password: '' };
    const [errors, setErrors] = useState(errorsObj);
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { ...errorsObj };
        if (email === '') {
            errorObj.email = 'El usuario es obligatorio';
            error = true;
        }
        if (password === '') {
            errorObj.password = 'La contraseña es obligatoria';
            error = true;
        }
        setErrors(errorObj);
        if (error) {
			return ;
		}
		
		dispatch(loadingToggleAction(true));

		dispatch(loginAction(email, password, navigate));
		
		/* dispatch(loginAction(email, password, props.history)).then((result) => {
			if(typeof(result) != 'undefined' && result != null && result.registered == true){
				navigate('/dashboard');
			}
		}); */
		
		//navigate('/dashboard');
    }

  return (
        
        
                
		<div className="container mt-0">
			<div className="row  align-items-center justify-contain-center bg-login">
				<div className="col-xl-12 mt-5">
					<div className="card border-0">
						<div className="card-body login-bx">
							<div className="row mt-5">
								<div className="col-xl-8 col-md-6  text-center d-flex align-items-center justify-content-center">
									<img src={logo} alt="Distribuidora del Sol" style={{ maxWidth: "85%", maxHeight: "420px", objectFit: "contain" }} />
								</div>
								<div className="col-xl-4 col-md-6 pe-0">
									<div className="sign-in-your">
										<div className="text-center mb-3">
											<h4 className="fs-20 font-w800 text-black">Iniciar sesión</h4>
											<span className="dlab-sign-up">Distribuidora del Sol</span>
										</div>
										{props.errorMessage && (
											<div className='bg-red-300 text-red-900 border border-red-900 p-1 my-2'>
												{props.errorMessage}
											</div>
										)}
										{props.successMessage && (
											<div className='bg-green-300 text-green-900 border border-green-900 p-1 my-2'>
												{props.successMessage}
											</div>
										)}
										<form onSubmit={onLogin}>
											<div className="mb-3">
												<label className="mb-1"><strong>Usuario o correo</strong></label>
												<input type="text" className="form-control" placeholder="Ingresa tu usuario o correo"
													value={email} onChange={(e) => setEmail(e.target.value)} />
												{errors.email && <div className="text-danger fs-12">{errors.email}</div>}
											</div>
											<div className="mb-3">
												<label className="mb-1"><strong>Contraseña</strong></label>
												<input type="password" className="form-control" placeholder="Ingresa tu contraseña"
													value={password} onChange={(e) => setPassword(e.target.value)} />
													{errors.password && <div className="text-danger fs-12">{errors.password}</div>}
											</div>
											<div className="mt-4 mb-2"></div>
											<div className="text-center">
												<button type="submit" className="btn btn-primary btn-block">Ingresar</button>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
            
    )
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};
export default connect(mapStateToProps)(Login);