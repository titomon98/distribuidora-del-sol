import { io } from "socket.io-client";

// Origen del backend (sin el sufijo /api que usa axios).
const API = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const ORIGIN = API.replace(/\/api\/?$/, "");

let socket;

/** Devuelve el socket compartido, uniéndose a la sala de la tienda del usuario. */
export function getSocket() {
	if (!socket) {
		socket = io(ORIGIN, { transports: ["websocket"], autoConnect: true });
		const unirse = () => {
			try {
				const d = localStorage.getItem("userDetails");
				const tiendaId = d ? JSON.parse(d).tiendaId : null;
				if (tiendaId) socket.emit("join", tiendaId);
			} catch { /* noop */ }
		};
		socket.on("connect", unirse);
		if (socket.connected) unirse();
	}
	return socket;
}
