import axios from 'axios';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pralayantaka-platform-production.up.railway.app/api';
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}
if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL += '/api';
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('[API Error]', message, error.response?.status);
        return Promise.reject(error);
    }
);