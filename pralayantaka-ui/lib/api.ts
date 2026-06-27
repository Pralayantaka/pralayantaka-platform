import axios from 'axios';

export const api = axios.create({
    // Replace with your actual Railway URL
    baseURL: 'https://pralayantaka-platform-production.up.railway.app',
    headers: {
        'Content-Type': 'application/json',
    },
});