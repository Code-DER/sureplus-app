import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Add token to all requests
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
    updateMyProfile: (profileData: Record<string, unknown>) => api.patch('/users/update', profileData),
    updateMySellerProfile: (sellerData: Record<string, unknown>) => api.patch('/sellers/update', sellerData),
    changeMyPassword: (passwordData: Record<string, unknown>) => api.post('/users/change-password', passwordData),
    upgradeToSeller: (sellerData: Record<string, unknown>) => api.post('/users/upgrade', sellerData),
};

// Charity API functions
export const charityAPI = {
    getAllCharities: () => api.get('/charities/list'),
    getMyCharityProfile: () => api.get('/charities/myprofile'),
    getCharityById: (userId: string) => api.get(`/charities/${userId}`),
    updateMyCharityProfile: (data: { organizationName: string }) => api.put('/charities/myprofile', data),
};

// Charity Post API functions
export const charityPostAPI = {
    getAllPosts: () => api.get('/charity-posts/'),
    getPostsByUser: (userId: string) => api.get(`/charity-posts/by-user/${userId}`),
    getPostById: (charityId: string) => api.get(`/charity-posts/${charityId}`),
    createPost: (data: { title: string, description?: string, amountNeeded: number }) => api.post('/charity-posts/', data),
    updatePost: (charityId: string, data: Partial<{ title: string, description: string, amountNeeded: number }>) => api.put(`/charity-posts/${charityId}`, data),
    deletePost: (charityId: string) => api.delete(`/charity-posts/${charityId}`),
    donateToPost: (charityId: string, amount: number) => api.post(`/charity-posts/${charityId}/donate`, { amount }),
};

// Social Impact API functions
export const socialImpactAPI = {
    getImpactByPurchase: (purchaseId: string) => api.get(`/social-impact/purchase/${purchaseId}`),
    getMyImpactSummary: () => api.get('/social-impact/summary'),
};

// Food / Product API functions
export const foodAPI = {
    list: (params?: {
        safe_for_me?: boolean;
        edible_only?: boolean;
        include_expired?: boolean;
        seller_id?: string;
    }) => api.get('/products/', { params }),
    get: (foodId: string) => api.get(`/products/${foodId}`),
    create: (data: Record<string, unknown>) => api.post('/products/', data),
    update: (foodId: string, data: Record<string, unknown>) => api.patch(`/products/${foodId}`, data),
    delete: (foodId: string) => api.delete(`/products/${foodId}`),
    uploadImage: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/products/upload-image', form);
    },
};

// Safety / Allergens API functions
export const safetyAPI = {
    listAllergens: () => api.get('/safety/allergens'),
};

// Purchases API functions
export const purchasesAPI = {
    getSellerPurchases: (sellerId: string) => api.get(`/purchases/purchase/seller/${sellerId}`),
};

// Ratings API functions
export const ratingsAPI = {
    getSellerRatings: (sellerId: string) => api.get(`/ratings/rating/seller/${sellerId}`),
};

// Notifications API functions
export const notificationsAPI = {
    getMyNotifications: () => api.get('/notifications/list'),
    markNotificationAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    markAllNotificationsAsRead: () => api.patch('/notifications/read-all'),
};

export const purchaseAPI = {
    createPurchase: (data) => api.post('/purchases/purchase', data),

    completePurchase: (purchaseID: string) =>
        api.put(`/purchases/purchase/${purchaseID}/complete`),

    getSellerPurchases: (sellerID: string) =>
        api.get(`/purchases/purchase/seller/${sellerID}`)
};

export default api;
