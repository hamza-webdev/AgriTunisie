// frontend/src/services/cultureService.test.js
import { apiService } from './apiService';
import {
    getAllCultures,
    getCultureById,
    createCulture,
    updateCulture,
    deleteCulture
} from './cultureService';

// Mock the apiService
jest.mock('./apiService', () => ({
    apiService: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('cultureService', () => {
    afterEach(() => {
        // Clear all mock call history after each test
        jest.clearAllMocks();
    });

    describe('getAllCultures', () => {
        it('should call apiService.get with correct endpoint for default pagination', async () => {
            apiService.get.mockResolvedValue({ data: [], pagination: {} });
            await getAllCultures();
            expect(apiService.get).toHaveBeenCalledWith('/cultures?page=1&limit=10');
        });

        it('should call apiService.get with correct endpoint for specified pagination', async () => {
            apiService.get.mockResolvedValue({ data: [], pagination: {} });
            await getAllCultures(2, 20);
            expect(apiService.get).toHaveBeenCalledWith('/cultures?page=2&limit=20');
        });

        it('should return data from apiService.get', async () => {
            const mockData = { data: [{ id: 1, name: 'Blé' }], pagination: { totalPages: 1 } };
            apiService.get.mockResolvedValue(mockData);
            const result = await getAllCultures();
            expect(result).toEqual(mockData);
        });

        it('should throw an error if apiService.get fails', async () => {
            const errorMessage = 'Network Error';
            apiService.get.mockRejectedValue(new Error(errorMessage));
            await expect(getAllCultures()).rejects.toThrow(errorMessage);
        });
    });

    describe('getCultureById', () => {
        it('should call apiService.get with correct endpoint', async () => {
            apiService.get.mockResolvedValue({ id: 1, name: 'Blé' });
            const cultureId = '123';
            await getCultureById(cultureId);
            expect(apiService.get).toHaveBeenCalledWith(`/cultures/${cultureId}`);
        });

        it('should return data from apiService.get', async () => {
            const mockCulture = { id: 1, name: 'Blé' };
            apiService.get.mockResolvedValue(mockCulture);
            const result = await getCultureById('1');
            expect(result).toEqual(mockCulture);
        });

        it('should throw an error if apiService.get fails', async () => {
            const errorMessage = 'API Error';
            apiService.get.mockRejectedValue(new Error(errorMessage));
            await expect(getCultureById('1')).rejects.toThrow(errorMessage);
        });
    });

    describe('createCulture', () => {
        const cultureData = { nom_culture: 'Orge', description_generale: 'Céréale robuste' };

        it('should call apiService.post with correct endpoint and data', async () => {
            apiService.post.mockResolvedValue({ ...cultureData, id: 'newId' });
            await createCulture(cultureData);
            expect(apiService.post).toHaveBeenCalledWith('/cultures', cultureData);
        });

        it('should return the created culture data from apiService.post', async () => {
            const createdCulture = { ...cultureData, id: 'newId' };
            apiService.post.mockResolvedValue(createdCulture);
            const result = await createCulture(cultureData);
            expect(result).toEqual(createdCulture);
        });

        it('should log a warning message', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            apiService.post.mockResolvedValue({ ...cultureData, id: 'newId' });
            await createCulture(cultureData);
            expect(consoleWarnSpy).toHaveBeenCalledWith("Tentative de création de culture : la route backend POST /cultures n'est peut-être pas active.");
            consoleWarnSpy.mockRestore();
        });

        it('should throw an error if apiService.post fails', async () => {
            const errorMessage = 'Failed to create';
            apiService.post.mockRejectedValue(new Error(errorMessage));
            await expect(createCulture(cultureData)).rejects.toThrow(errorMessage);
        });
    });

    describe('updateCulture', () => {
        const cultureId = '123';
        const cultureData = { nom_culture: 'Maïs', description_generale: 'Grande culture d\'été' };

        it('should call apiService.put with correct endpoint and data', async () => {
            apiService.put.mockResolvedValue({ ...cultureData, id: cultureId });
            await updateCulture(cultureId, cultureData);
            expect(apiService.put).toHaveBeenCalledWith(`/cultures/${cultureId}`, cultureData);
        });

        it('should return the updated culture data from apiService.put', async () => {
            const updatedCulture = { ...cultureData, id: cultureId };
            apiService.put.mockResolvedValue(updatedCulture);
            const result = await updateCulture(cultureId, cultureData);
            expect(result).toEqual(updatedCulture);
        });

        it('should log a warning message', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            apiService.put.mockResolvedValue({ ...cultureData, id: cultureId });
            await updateCulture(cultureId, cultureData);
            expect(consoleWarnSpy).toHaveBeenCalledWith(`Tentative de mise à jour de la culture ${cultureId} : la route backend PUT /cultures/:id n'est peut-être pas active.`);
            consoleWarnSpy.mockRestore();
        });

        it('should throw an error if apiService.put fails', async () => {
            const errorMessage = 'Update failed';
            apiService.put.mockRejectedValue(new Error(errorMessage));
            await expect(updateCulture(cultureId, cultureData)).rejects.toThrow(errorMessage);
        });
    });

    describe('deleteCulture', () => {
        const cultureId = '456';

        it('should call apiService.delete with correct endpoint', async () => {
            apiService.delete.mockResolvedValue({ message: 'Culture deleted' });
            await deleteCulture(cultureId);
            expect(apiService.delete).toHaveBeenCalledWith(`/cultures/${cultureId}`);
        });

        it('should return data from apiService.delete', async () => {
            const deleteResponse = { message: 'Culture deleted successfully' };
            apiService.delete.mockResolvedValue(deleteResponse);
            const result = await deleteCulture(cultureId);
            expect(result).toEqual(deleteResponse);
        });

        it('should log a warning message', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            apiService.delete.mockResolvedValue({ message: 'Culture deleted' });
            await deleteCulture(cultureId);
            expect(consoleWarnSpy).toHaveBeenCalledWith(`Tentative de suppression de la culture ${cultureId} : la route backend DELETE /cultures/:id n'est peut-être pas active.`);
            consoleWarnSpy.mockRestore();
        });

        it('should throw an error if apiService.delete fails', async () => {
            const errorMessage = 'Deletion failed';
            apiService.delete.mockRejectedValue(new Error(errorMessage));
            await expect(deleteCulture(cultureId)).rejects.toThrow(errorMessage);
        });
    });
});
