import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// Adjunta el JWT del backend como Bearer en cada petición.
axiosInstance.interceptors.request.use((config) => {
    const details = localStorage.getItem('userDetails');
    if (details) {
        const { idToken } = JSON.parse(details);
        if (idToken) config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
});

export default axiosInstance;
