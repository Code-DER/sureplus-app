import axios from "axios";
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { CharityDonationResult } from './types';

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
    updateMyCharityProfile: (data: Partial<{ 
        organizationName: string,
        firstName: string,
        lastName: string,
        phoneNumber: string,
        street: string,
        barangay: string,
        city: string
    }>) => api.put('/charities/myprofile', data),
    
    // Application endpoints
    submitApplication: (data: { purpose: string, govID: string, secRegistration?: string }) => api.post('/charity-applications/', data),
    getMyApplications: () => api.get('/charity-applications/mine'),
    getPendingApplications: () => api.get('/charity-applications/pending'),
    reviewApplication: (applicationId: string, data: { status: 'approved' | 'rejected', organizationName?: string }) => 
        api.put(`/charity-applications/${applicationId}/review`, data),
};

// Admin API functions
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (page = 1, limit = 10, role?: string) => api.get('/admin/users', { params: { page, limit, role } }),
    updateUserRole: (userId: string, role: 'buyer' | 'seller' | 'charity' | 'admin', employeeID?: string, adminType?: string) =>
        api.patch(`/admin/users/${userId}/role`, { role, employeeID, adminType }),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
    getCharities: () => api.get('/admin/charities'),
    togglePartnerStatus: (userId: string, isPartner: boolean) => api.put(`/admin/charities/${userId}/partner`, { isPartner }),
    getSellers: () => api.get('/admin/sellers'),
    updateSellerTags: (sellerId: string, tags: string[]) => api.patch(`/admin/sellers/${sellerId}/tags`, tags),
    getPendingApprovals: () => api.get('/admin/pending-approvals'),
    getRecentTransactions: (limit = 10) => api.get('/admin/reports/transactions', { params: { limit } }),
    getReportsOverview: () => api.get('/admin/reports/overview'),
    getBadActorsReport: (limit = 10) => api.get('/admin/reports/bad-actors', { params: { limit } }),
    createAdmin: (data: { firstName: string; lastName: string; emailAddress: string; password: string }) =>
        api.post('/admin/users', data),
    getAdminActivity: (params?: { actionType?: string; targetEntity?: string; userID?: string; targetID?: string; limit?: number }) =>
        api.get('/admin-activity/', { params }),
    updateCharityPost: (id: string, data: Partial<{ 
        title: string, 
        description: string, 
        imageUrl: string,
        amountNeeded: number, 
        foodGoalKg: number,
        status: "active" | "funded" | "closed"
    }>) => api.put(`/admin/charity-posts/${id}`, data),
    deleteCharityPost: (id: string) => api.delete(`/admin/charity-posts/${id}`),
    updateCharity: (userId: string, data: { organizationName: string }) => api.put(`/admin/charities/${userId}`, data),
    deleteCharity: (userId: string) => api.delete(`/admin/charities/${userId}`),
};

// Charity Post API functions
export const charityPostAPI = {
    getAllPosts: (params?: { 
        limit?: number, 
        offset?: number, 
        search?: string,
        donation_mode?: string,
        status?: string
    }) => api.get('/charity-posts/', { params }),
    getPostsByUser: (userId: string, params?: { limit?: number, offset?: number }) => 
        api.get(`/charity-posts/by-user/${userId}`, { params }),
    getUserPostStats: (userId: string) => api.get(`/charity-posts/by-user/${userId}/stats`),
    getPostById: (charityId: string) => api.get(`/charity-posts/${charityId}`),
    createPost: (data: { 
        title: string, 
        description?: string, 
        imageUrl?: string,
        donationMode: "money" | "food" | "both", 
        amountNeeded?: number, 
        foodGoalKg?: number 
    }) => api.post('/charity-posts/', data),
    updatePost: (charityId: string, data: Partial<{ 
        title: string, 
        description: string, 
        imageUrl: string,
        amountNeeded: number, 
        foodGoalKg: number,
        status: "active" | "funded" | "closed"
    }>) => api.put(`/charity-posts/${charityId}`, data),
    deletePost: (charityId: string) => api.delete(`/charity-posts/${charityId}`),
    donateToPost: (charityId: string, donation: {
        donationType: "money" | "food",
        amount?: number,
        foodID?: string,
        quantity?: number
    }) => api.post<CharityDonationResult>(`/charity-posts/${charityId}/donate`, donation),
    getDonationsByPost: (charityId: string) => api.get(`/charity-posts/${charityId}/donations`),
    getMyDonations: () => api.get('/charity-posts/donations/my-donations'),
    rateDonor: (postId: string, donationId: string, data: { rating: number, comment?: string }) => 
        api.post(`/charity-posts/${postId}/donations/${donationId}/rate`, data),
};

// Social Impact API functions
export const socialImpactAPI = {
    getImpactByPurchase: (purchaseId: string) => api.get(`/social-impact/purchase/${purchaseId}`),
    getImpactByDonation: (donationId: string) => api.get(`/social-impact/donation/${donationId}`),
    getMyImpactSummary: () => api.get('/social-impact/summary'),
    getImpactHistory: () => api.get('/social-impact/history'),
    getGlobalImpact: () => api.get('/social-impact/global'),
};

// Ratings API functions
export const ratingsAPI = {
    rate: (data: { 
        purchaseID?: string, 
        donationID?: string, 
        rating: number, 
        comment?: string 
    }) => api.post('/ratings/', data),
    getSellerRatings: (sellerId: string) => api.get(`/ratings/seller/${sellerId}`),
};

// Purchase API functions
export const purchaseAPI = {
    create: (data: { userID: string, paymentMethod: string, items: { foodID: string, quantity: number }[] }) => api.post('/purchases/purchase', data),
    complete: (purchaseId: string) => api.put(`/purchases/purchase/${purchaseId}/complete`),
    getSellerPurchases: (sellerId: string) => api.get(`/purchases/purchase/seller/${sellerId}`),
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

// Notifications API functions
export const notificationsAPI = {
    getMyNotifications: () => api.get('/notifications/list'),
    markNotificationAsRead: (notificationId: string) => api.patch(`/notifications/${notificationId}/read`),
    markAllNotificationsAsRead: () => api.patch('/notifications/read-all'),
};

// Uploads API functions
export const uploadsAPI = {
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export const charityApplicationsAPI = {
    getPending: () => api.get('/charity-applications/pending'),
    review: (applicationId: string, data: { status: 'approved' | 'rejected'; organizationName?: string }) =>
        api.put(`/charity-applications/${applicationId}/review`, data),
};

export default api;
