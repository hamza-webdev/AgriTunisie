// Service Parcelles (Répété ici, serait dans src/services/parcelleService.js)
import { apiService } from './apiService'; // Assuming apiService.js is in the same directory

export const getUserParcelles = async (page = 1, limit = 10) => apiService.get(`/parcelles/user?page=${page}&limit=${limit}`);
export const getParcelleById = async (id) => apiService.get(`/parcelles/${id}`);
export const createParcelle = async (parcelleData) => apiService.post('/parcelles', parcelleData);
export const updateParcelle = async (id, parcelleData) => apiService.put(`/parcelles/${id}`, parcelleData);
export const deleteParcelle = async (id) => apiService.delete(`/parcelles/${id}`);