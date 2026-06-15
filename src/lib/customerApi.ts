import { useCustomerAuthStore } from '../store/customerAuthStore';

const API_URL = '/api/customer';
const AUTH_URL = '/api/customer/auth';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = useCustomerAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    useCustomerAuthStore.getState().logout();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
};

export const customerApi = {
  // Auth
  register: (data: any) => fetchWithAuth(`${AUTH_URL}/register`, { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => fetchWithAuth(`${AUTH_URL}/login`, { method: 'POST', body: JSON.stringify(data) }),
  requestPasswordReset: (data: any) => fetchWithAuth(`${AUTH_URL}/reset-password/request`, { method: 'POST', body: JSON.stringify(data) }),
  verifyPasswordReset: (data: any) => fetchWithAuth(`${AUTH_URL}/reset-password/verify`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Profile
  getProfile: () => fetchWithAuth(`${API_URL}/profile`),
  updateProfile: (data: any) => fetchWithAuth(`${API_URL}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: any) => fetchWithAuth(`${API_URL}/password`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Orders
  getOrders: () => fetchWithAuth(`${API_URL}/orders`),
  
  // Addresses
  getAddresses: () => fetchWithAuth(`${API_URL}/addresses`),
  createAddress: (data: any) => fetchWithAuth(`${API_URL}/addresses`, { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: any) => fetchWithAuth(`${API_URL}/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => fetchWithAuth(`${API_URL}/addresses/${id}`, { method: 'DELETE' }),
  
  // Rewards & Referrals
  getRewards: () => fetchWithAuth(`${API_URL}/rewards`),
  getReferrals: () => fetchWithAuth(`${API_URL}/referrals`),
};
