import axios from 'axios';

// --- CẤU HÌNH CHUNG ---
const API_BASE_URL = 'https://datn-0v3f.onrender.com';
// const API_BASE_URL = 'http://26.118.131.110:8080';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(config => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


// --- API XÁC THỰC ---
export const login = async (username, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};

export const registerUser = (userData) => {
  return axios.post(`${API_BASE_URL}/api/accounts/register/user`, userData);
};

export const registerCompany = (companyData) => {
  return axios.post(`${API_BASE_URL}/api/accounts/register/company`, companyData);
};


// --- API USER ---
export const updateUserProfile = (userId, profileData) => {
    return apiClient.put(`/accounts/user/${userId}`, profileData);
};

export const updateAvatar = (accountId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.put(`/accounts/${accountId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getCurrentUser = async () => {
    const response = await apiClient.get('/accounts/me/user');
    return response.data;
};


// --- API COMPANY ---
export const getCurrentCompany = async () => {
    const response = await apiClient.get('/accounts/me/company');
    return response.data;
};

export const updateCompanyProfile = (accountId, profileData) => {
    return apiClient.put(`/accounts/company/${accountId}`, profileData);
};

// --- API COMPANY DASHBOARD ---
export const getMonthlyReviews = (locationId, year, month) =>
    apiClient.get(`/company/dashboard/${locationId}/reviews/monthly`, { params: { year, month } });

export const getAdPerformance = () => apiClient.get('/company/dashboard/ad-performance');
export const getMonthlyLocationSummary = (locationId) => apiClient.get(`/company/dashboard/${locationId}/monthly-summary`);


// --- API LOCATION & REVIEWS ---
export const searchLocations = (query) => apiClient.get(`/locations?q=${encodeURIComponent(query)}`);
export const getLocationById = (locationId) => apiClient.get(`/locations/${locationId}`);
export const getReviewsByLocation = (locationId) => apiClient.get(`/reviews/location/${locationId}`);
export const getCategories = () => apiClient.get('/categories');
export const getActiveReviewsAndAverageRating = (locationId) => {
  return apiClient.get(`/reviews/location/${locationId}/active`);
};
export const getAverageRating = (locationId) => apiClient.get(`/reviews/average/${locationId}`);
export const writeReview = ({ locationId, rating, comment, images, userId }) => {
    const formData = new FormData();
    formData.append('locationId', locationId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    formData.append('userId', userId);
    if (images && images.length > 0) {
        images.forEach((image) => {
            formData.append('images', image);
        });
    }
    return apiClient.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const replyToReview = (reviewId, content, userId) => {
    const formData = new FormData();
    formData.append('parentReviewId', reviewId);
    formData.append('comment', content);
    formData.append('userId', userId);
    return apiClient.post('/reviews/reply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const submitReview = writeReview;
export const createLocationWithImages = (locationData, images) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(locationData));
    images.forEach((image) => {
        formData.append('image', image);
    });
    return apiClient.post('/locations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const createLocationByStaff = (locationData, images) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(locationData));
    images.forEach((image) => {
        formData.append('image', image);
    });
    return apiClient.post('/locations/staff', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const updateLocation = (locationId, locationData) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(locationData));

    return apiClient.put(`/locations/${locationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const logDirectionRequest = (locationId) => apiClient.post(`/locations/${locationId}/direction`);


// --- API FAVORITES, ADS, RECOMMENDATIONS ---
export const getFavorites = () => apiClient.get('/favorites/me');
export const toggleFavorite = (locationId) => apiClient.post(`/favorites/toggle/${locationId}`);
export const getAds = () => apiClient.get('/ads');
// export const getRecommendations = (data) => axios.post('http://26.118.131.110:3001/api/get-recommendations', data);
export const getRecommendations = (data) => axios.post('https://datn-nodejs-yg5k.onrender.com/api/get-recommendations', data);
export const logAdClick = (adId) => apiClient.post(`/ads/${adId}/click`);


// --- API CHUNG & STAFF ---
export const createContactInfo = (contactData) => apiClient.post('/contact-info', contactData);
export const getAllContactInfo = () => apiClient.get('/contact-info');
export const getAllAccounts = () => apiClient.get('/accounts');
export const getPendingCompanyAccounts = () => apiClient.get('/accounts/pending');
export const approveCompanyAccount = (accountId) => apiClient.put(`/accounts/${accountId}/approve`);
export const rejectCompanyAccount = (accountId) => apiClient.put(`/accounts/${accountId}/reject`);
export const updateAccountStatus = (accountId, status) => apiClient.put(`/accounts/${accountId}/status`, null, { params: { status } });
export const getPendingAccountDetail = (accountId) => apiClient.get(`/accounts/pending/${accountId}`);
export const getAllLocations = () => apiClient.get('/locations');
export const getCompanyLocations = () => apiClient.get('/locations/me/company');
export const getCompanyLocationsForAd = () => apiClient.get('/locations/me/company/ad');
export const getPendingLocations = () => apiClient.get('/locations/pending');
export const approveLocation = (locationId) => apiClient.put(`/locations/${locationId}/approve`);
export const rejectLocation = (locationId) => apiClient.put(`/locations/${locationId}/reject`);
export const deleteLocation = (locationId) => apiClient.delete(`/locations/${locationId}`);
export const getPendingLocationDetail = (locationId) => apiClient.get(`/locations/pending/${locationId}`);
export const getLocationDetail = (locationId) => apiClient.get(`/locations/${locationId}`);
export const getAllReviews = () => apiClient.get('/reviews');
export const getPendingReviews = () => apiClient.get('/reviews/pending');
export const approveReview = (reviewId) => apiClient.put(`/reviews/${reviewId}/approve`);
export const rejectReview = (reviewId) => apiClient.put(`/reviews/${reviewId}/reject`);
export const deleteReview = (reviewId) => apiClient.delete(`/reviews/${reviewId}`);
export const getAllAds = () => apiClient.get('/ads');
export const getCompanyAds = () => apiClient.get('/ads/me');
export const getPendingAds = () => apiClient.get('/ads/pending');
export const approveAd = (adId) => apiClient.put(`/ads/${adId}/approve`);
export const rejectAd = (adId) => apiClient.put(`/ads/${adId}/reject`);
export const deleteAd = (adId) => apiClient.delete(`/ads/${adId}`);
export const createAd = (adData) => apiClient.post('/ads', adData);
export const getAllCategories = () => apiClient.get('/categories');
export const createPayment = (amount, adId) => apiClient.get(`/payment/create-payment`, { params: { amount, adId } });

// --- API NOTIFICATIONS ---
export const getStaffNotifications = (userId) => apiClient.get(`/notifications/for-staff-from-admin`, { params: { userId } });
export const getCompanyRegisteredNotifications = () => apiClient.get('/notifications/company-registered');
export const getUserRegisteredNotifications = () => apiClient.get('/notifications/user-registered');
export const getAdsCreatedNotifications = () => apiClient.get('/notifications/ads-created');
export const getLocationsCreatedNotifications = () => apiClient.get('/notifications/locations-created');
export const getReviewsCreatedNotifications = () => apiClient.get('/notifications/reviews-created');


// --- API ADMIN ---
export const getAllStaffAccounts = () => apiClient.get('/accounts/staff');
export const createAccount = (accountData) => apiClient.post('/accounts', accountData);
export const updateAccount = (accountId, accountData) => apiClient.put(`/accounts/${accountId}`, accountData);
export const deleteAccount = (accountId) => apiClient.delete(`/accounts/${accountId}`);
export const getAdminDashboardSummary = () => apiClient.get('/admin/dashboard/summary');
export const getAdminDashboardGrowth = (period = 'month') => apiClient.get('/admin/dashboard/growth-chart', { params: { period } });
export const sendNotificationToRole = (adminId, requestBody) => apiClient.post(`/notifications/send-to-role`, requestBody, { params: { adminId } });


// --- API TÀI LIỆU (DOCUMENTS) ---
const UPLOAD_API_BASE_URL = `${API_BASE_URL}/api/upload`;

export const listDocuments = (path = 'docs') => {
    return axios.get(`${UPLOAD_API_BASE_URL}/list`, { params: { path } });
};

export const getDocumentDownloadUrl = (filePath, disposition = 'attachment') => {
    return `${UPLOAD_API_BASE_URL}/download?filePath=${encodeURIComponent(filePath)}&disposition=${disposition}`;
};

export const uploadDocument = (file, path) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${UPLOAD_API_BASE_URL}/upload`, formData, {
        params: { path },
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// SỬA LẠI: Gửi đúng tham số `isFolder`
export const deleteDocument = (path, isFolder = false) => {
    return axios.delete(`${UPLOAD_API_BASE_URL}/delete`, { params: { path, isFolder } });
};

// THÊM MỚI: API tạo và đổi tên
export const createFolder = (path) => {
    return axios.post(`${UPLOAD_API_BASE_URL}/create-folder`, null, { params: { path } });
};

export const renameDocument = (oldPath, newPath, type = 'file') => {
    return axios.post(`${UPLOAD_API_BASE_URL}/rename`, null, { params: { oldPath, newPath, type } });
};
export const moveFile = (sourcePath, targetFolder) => {
    return axios.post(`${UPLOAD_API_BASE_URL}/move-file`, null, { params: { sourcePath, targetFolder } });
};