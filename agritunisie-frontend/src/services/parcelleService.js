// Service Parcelles (Répété ici, serait dans src/services/parcelleService.js)
export const parcelleService = {
    getUserParcelles: async (page = 1, limit = 10) => apiService.get(`/parcelles/user?page=${page}&limit=${limit}`),
    getParcelleById: async (id) => apiService.get(`/parcelles/${id}`),
    createParcelle: async (parcelleData) => apiService.post('/parcelles', parcelleData),
    updateParcelle: async (id, parcelleData) => apiService.put(`/parcelles/${id}`, parcelleData),
    deleteParcelle: async (id) => apiService.delete(`/parcelles/${id}`),
};