import swal from "sweetalert";
import axiosInstance from './AxiosInstance';
import {
    Logout,
    loginConfirmedAction,
} from '../store/actions/AuthActions';

// El backend (NestJS) responde con { idToken, expiresIn, localId, email, displayName, rol, tiendaId }.
export function login(email, password) {
    return axiosInstance.post('/auth/login', { email, password });
}

// El alta de usuarios es tarea del administrador dentro del sistema, no un
// registro público. Se deshabilita el signUp del template.
export function signUp() {
    return Promise.reject({
        response: { data: { message: 'El registro público está deshabilitado.' } },
    });
}

export function formatError(errorResponse) {
    // Errores del backend NestJS: { statusCode, message, error }.
    const msg = errorResponse && errorResponse.message;
    if (msg) {
        swal("Error", Array.isArray(msg) ? msg.join('\n') : msg, "error", { button: "Reintentar" });
        return msg;
    }
    swal("Error", "No se pudo conectar con el servidor.", "error");
    return '';
}

export function saveTokenInLocalStorage(tokenDetails) {
    tokenDetails.expireDate = new Date(
        new Date().getTime() + tokenDetails.expiresIn * 1000,
    );
    localStorage.setItem('userDetails', JSON.stringify(tokenDetails));
}

export function runLogoutTimer(dispatch, timer, navigate) {
    setTimeout(() => {
        dispatch(Logout(navigate));
    }, timer);
}

export function checkAutoLogin(dispatch, navigate) {
    const tokenDetailsString = localStorage.getItem('userDetails');
    let tokenDetails = '';
    if (!tokenDetailsString) {
        dispatch(Logout(navigate));
		return;
    }

    tokenDetails = JSON.parse(tokenDetailsString);
    let expireDate = new Date(tokenDetails.expireDate);
    let todaysDate = new Date();

    if (todaysDate > expireDate) {
        dispatch(Logout(navigate));
        return;
    }

    dispatch(loginConfirmedAction(tokenDetails));

    const timer = expireDate.getTime() - todaysDate.getTime();
    runLogoutTimer(dispatch, timer, navigate);
}
