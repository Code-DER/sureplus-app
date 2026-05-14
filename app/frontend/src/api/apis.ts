import axios from "axios";
import { jwtDecode, type JwtPayload } from 'jwt-decode';

export interface SureplusJwtPayload extends JwtPayload {
  userID: string;
  role: string;
}

export const getAuthUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<SureplusJwtPayload>(token);
    return decoded;
  } catch {
    return null;
  }
};

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
    
    // Application endpoints
    submitApplication: (data: { purpose: string, govID: string }) => api.post('/charity-applications/', data),
    getMyApplications: () => api.get('/charity-applications/mine'),
    getPendingApplications: () => api.get('/charity-applications/pending'),
    reviewApplication: (applicationId: string, data: { status: 'approved' | 'rejected', organizationName?: string }) => 
        api.put(`/charity-applications/${applicationId}/review`, data),
};

// Charity Post API functions
export const charityPostAPI = {
    getAllPosts: (params?: { limit?: number, offset?: number, search?: string }) => api.get('/charity-posts/', { params }),
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

// Purchase API functions
export const purchaseAPI = {
    create: (data: { userID: string, paymentMethod: string, items: { foodID: string, quantity: number }[] }) => api.post('/purchase', data),
    complete: (purchaseId: string) => api.put(`/purchase/${purchaseId}/complete`),
};

// Food API functions
export const foodAPI = {
  list: (params?: {
    safe_for_me?: boolean;
    edible_only?: boolean;
    include_expired?: boolean;
    seller_id?: string;
  }) => api.get('/products/', { params }),
  get: (foodId: string) => api.get(`/products/${foodId}`),
};

// Notifications API functions
export const notificationsAPI = {
    getMyNotifications: () => api.get('/notifications/list'),
    markNotificationAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    markAllNotificationsAsRead: () => api.patch('/notifications/read-all'),
};

export default api;