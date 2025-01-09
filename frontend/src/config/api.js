const API_BASE_URL = 'http://localhost:5000/api' || process.env.REACT_APP_API_BASE_URL;

export const endpoints = {
    inventory: {
        getAll: `${API_BASE_URL}/inventory`,
        getNearExpiry: `${API_BASE_URL}/inventory/near-expiry`,
        add: `${API_BASE_URL}/inventory`,
    },
    donations: {
        getAvailable: `${API_BASE_URL}/donations/available`,
        donate: (id) => `${API_BASE_URL}/donations/donate/${id}`,
    },
    analytics: {
        getStats: `${API_BASE_URL}/analytics/stats`,
        getCategoryDistribution: `${API_BASE_URL}/analytics/category-distribution`,
    }
}; 