import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Add token to all  requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (unauthorized) responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('token_type');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// User API functions
export const userAPI = {
    getMyProfile: () => api.get('/users/myprofile'),
    getMyBuyerProfile: () => api.get('/buyers/me'),
    getMySellerProfile: () => api.get('/sellers/me'),
    getMyImpactSummary: () => api.get('/social-impact/summary'),
};

export default api;