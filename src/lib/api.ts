const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => localStorage.getItem('token');

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  },

  patch: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  },

  auth: {
    signup: (data: any) => api.post('/auth/signup', data),
    login: async (data: any) => {
      console.log('Making login request to:', `${API_URL}/auth/login`);
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        console.log('Login response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.log('Login error data:', errorData);
          throw new Error(errorData.message || 'Login failed');
        }
        const result = await response.json();
        console.log('Login success data:', result);
        return result;
      } catch (error) {
        console.error('Login fetch error:', error);
        throw error;
      }
    },
  },

  admin: {
    getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.search) query.append('search', params.search);
      return api.get(`/admin/users?${query.toString()}`);
    },
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    promoteUser: (id: string) => api.put(`/admin/users/${id}/promote`, {}),
    demoteUser: (id: string) => api.put(`/admin/users/${id}/demote`, {}),
    getStats: () => api.get('/admin/stats'),
    getUserStats: () => api.get('/admin/users/stats'),
  },

  blog: {
    list: () => api.get('/blog'),
    get: (slug: string) => api.get(`/blog/${slug}`),
    create: (data: FormData) => {
      const token = getAuthToken();
      return fetch(`${API_URL}/blog`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      }).then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = 'Failed to create blog';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return res.json();
      });
    },
    update: (id: string, data: FormData) => {
      const token = getAuthToken();
      return fetch(`${API_URL}/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      }).then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = 'Failed to update blog';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        return res.json();
      });
    },
    delete: (id: string) => api.delete(`/blog/${id}`),
    getAll: () => api.get('/blog/all'),
    uploadImage: (imageFile: File) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return api.post('/blog/upload-image', formData);
    },
  },

  p2p: {
    // Offers
    getOffers: (params?: any) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/p2p/offers${queryString}`);
    },
    createOffer: (data: any) => api.post('/p2p/offers', data),
    getMyOffers: (params?: any) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/p2p/my-offers${queryString}`);
    },
    updateOfferStatus: (id: string, status: string) => api.patch(`/p2p/offers/${id}/status`, { status }),
    acceptOffer: (id: string, data: any) => api.post(`/p2p/offers/${id}/accept`, data),

    // Trades
    getTrades: (params?: any) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/p2p/trades${queryString}`);
    },
    updateTradeStatus: (id: string, data: any) => api.patch(`/p2p/trades/${id}/status`, data),

    // Reference data
    getSupportedCryptos: () => api.get('/p2p/supported-cryptos'),
    getSupportedFiats: () => api.get('/p2p/supported-fiats'),
    getPaymentMethods: () => api.get('/p2p/payment-methods'),
    getNetworks: () => api.get('/p2p/networks'),

    // Wallet management
    getWallets: () => api.get('/p2p/wallets'),
    createWallet: (data: any) => api.post('/p2p/wallets', data),
    updateWallet: (id: string, data: any) => api.patch(`/p2p/wallets/${id}`, data),
    deleteWallet: (id: string) => api.delete(`/p2p/wallets/${id}`),

    // Deposit management
    createDeposit: (data: any) => api.post('/p2p/deposits', data),
    getDeposits: (params?: any) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return api.get(`/p2p/deposits${queryString}`);
    },

    // Wallet utilities
    getWalletQR: (walletId: string, amount?: number) => {
      const queryString = amount ? `?amount=${amount}` : '';
      return api.get(`/p2p/wallets/${walletId}/qr${queryString}`);
    },
  },
};
