// frontend/src/pages/cultures/CulturesListPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CulturesListPage from './CulturesListPage';
import * as cultureService from '../../services/cultureService'; // Import all as cultureService
import { Button } from '../../components/common/Button'; // Actual component for props check

// Mock cultureService
jest.mock('../../services/cultureService');

// Mock common components used by CulturesListPage to simplify tests if needed,
// or let them render if they are simple enough / part of what's being tested.
// For this example, we'll mock LoadingSpinner and assume Button/Card are simple enough or tested elsewhere.
jest.mock('../../components/common/LoadingSpinner', () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));
jest.mock('../../components/common/Card', () => ({
    Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>
}));
// Button is more complex due to variant/size/Icon props, but for basic clicks, direct import might be okay.
// If Button had complex internal logic that's not part of CulturesListPage's concern, mocking would be better.
// jest.mock('../../components/common/Button', () => ({
//  Button: ({ children, onClick, ...props }) => <button onClick={onClick} {...props}>{children}</button>
// }));


const mockNavigateTo = jest.fn();

const mockCulturesData = {
    data: [
        { id: '1', nom_culture: 'Blé', periode_semis_ideale_debut: 'Oct', periode_semis_ideale_fin: 'Nov' },
        { id: '2', nom_culture: 'Orge', periode_semis_ideale_debut: 'Sep', periode_semis_ideale_fin: 'Oct' },
    ],
    pagination: { currentPage: 1, totalPages: 2, totalItems: 4, limit: 2 },
};

const mockEmptyCulturesData = {
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 2 },
};

describe('CulturesListPage', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        cultureService.getAllCultures.mockResolvedValue(mockCulturesData); // Default successful response
        cultureService.deleteCulture.mockResolvedValue({}); // Default successful delete
    });

    test('renders page title and add culture button', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        // Wait for a key element that appears after loading to ensure data is loaded
        await screen.findByText('Catalogue des Cultures');
        expect(screen.getByText('Catalogue des Cultures')).toBeInTheDocument();
        expect(screen.getByText('Ajouter une Culture')).toBeInTheDocument();
    });

    test('displays loading spinner while fetching data', async () => {
        cultureService.getAllCultures.mockImplementationOnce(() =>
            new Promise(resolve => setTimeout(() => resolve(mockCulturesData), 100))
        );
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        await screen.findByText('Blé'); // Wait for data to load
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    test('displays cultures list when data is fetched successfully', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        // Wait for items to appear, indicating loading is complete and data is rendered
        await screen.findByText('Blé');

        expect(screen.getByText('Blé')).toBeInTheDocument();
        expect(screen.getByText('Orge')).toBeInTheDocument();
        expect(screen.getAllByText('Détails').length).toBe(2);
        expect(screen.getAllByText('Modifier').length).toBe(2);
        expect(screen.getAllByText('Supprimer').length).toBe(2);
    });

    test('displays pagination controls when totalPages > 1', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        // Wait for pagination text to appear
        await screen.findByText(/Page 1 sur 2/i);
        expect(screen.getByText(/Page 1 sur 2/i)).toBeInTheDocument();
        expect(screen.getByText('Précédent')).toBeDisabled(); // On page 1
        expect(screen.getByText('Suivant')).toBeEnabled();  // Can go to page 2
    });

    test('calls navigateTo with "addCulture" when add button is clicked', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Catalogue des Cultures'); // Ensure page is loaded
        fireEvent.click(screen.getByText('Ajouter une Culture'));
        expect(mockNavigateTo).toHaveBeenCalledWith('addCulture');
    });

    test('calls navigateTo with "cultureDetail" and cultureId when details button is clicked', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Blé'); // Ensure data is loaded

        const detailButtons = screen.getAllByText('Détails');
        fireEvent.click(detailButtons[0]); // Click details for 'Blé'
        expect(mockNavigateTo).toHaveBeenCalledWith('cultureDetail', '1');
    });

    test('calls navigateTo with "editCulture" and cultureId when edit button is clicked', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Blé'); // Ensure data is loaded

        const editButtons = screen.getAllByText('Modifier');
        fireEvent.click(editButtons[0]); // Click edit for 'Blé'
        expect(mockNavigateTo).toHaveBeenCalledWith('editCulture', '1');
    });

    test('calls deleteCulture and refetches data when delete button is clicked and confirmed', async () => {
        window.confirm = jest.fn(() => true); // Mock window.confirm
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Blé'); // Ensure data is loaded

        const deleteButtons = screen.getAllByText('Supprimer');
        fireEvent.click(deleteButtons[0]); // Click delete for 'Blé'

        expect(window.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer cette culture ? Cette action est irréversible.');
        await waitFor(() => expect(cultureService.deleteCulture).toHaveBeenCalledWith('1'));
        await waitFor(() => expect(cultureService.getAllCultures).toHaveBeenCalledTimes(2)); // Refetch after delete
    });

    test('does not call deleteCulture if not confirmed', async () => {
        window.confirm = jest.fn(() => false); // Mock window.confirm to return false
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Blé'); // Ensure data is loaded

        const deleteButtons = screen.getAllByText('Supprimer');
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
        expect(cultureService.deleteCulture).not.toHaveBeenCalled();
    });

    test('displays error message if fetching cultures fails', async () => {
        cultureService.getAllCultures.mockRejectedValueOnce(new Error('Failed to fetch cultures'));
        render(<CulturesListPage navigateTo={mockNavigateTo} />);

        await waitFor(() => expect(screen.getByText(/Erreur: Failed to fetch cultures/i)).toBeInTheDocument());
        expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    test('displays "Aucune culture trouvée" message when no cultures are available', async () => {
        cultureService.getAllCultures.mockResolvedValue(mockEmptyCulturesData);
        render(<CulturesListPage navigateTo={mockNavigateTo} />);

        await waitFor(() => expect(screen.getByText('Aucune culture trouvée dans le catalogue.')).toBeInTheDocument());
    });

    test('handles pagination: clicking "Suivant" fetches next page', async () => {
        render(<CulturesListPage navigateTo={mockNavigateTo} />);
        await screen.findByText('Suivant'); // Ensure pagination is rendered

        fireEvent.click(screen.getByText('Suivant'));
        await waitFor(() => expect(cultureService.getAllCultures).toHaveBeenCalledWith(2, 10)); // Call for page 2
        // You might also want to update mockCulturesData to reflect page 2 data and assert its display
    });

    test('handles pagination: clicking "Précédent" fetches previous page', async () => {
        // Setup initial state to be on page 2 by mocking the first call to return page 2 data if needed,
        // or by navigating as per component logic. Here, we'll simulate being on page 2.
        const mockPage2Data = { // Simulate data for page 2
            data: [{ id: '3', nom_culture: 'Avoine', periode_semis_ideale_debut: 'Mar', periode_semis_ideale_fin: 'Avr' }],
            // The component's internal limit is 10, so mock pagination should reflect that for consistency if strictly needed,
            // but the crucial part is what getAllCultures is CALLED with.
            pagination: { currentPage: 2, totalPages: 2, totalItems: 4, limit: 10 },
        };
        const componentInternalLimit = 10; // As defined in CulturesListPage state

        // First call for page 1
        cultureService.getAllCultures.mockResolvedValueOnce(mockCulturesData);
        // Subsequent call for page 2
        cultureService.getAllCultures.mockResolvedValueOnce(mockPage2Data);
         // Subsequent call for page 1 after clicking previous
        cultureService.getAllCultures.mockResolvedValueOnce(mockCulturesData);


        render(<CulturesListPage navigateTo={mockNavigateTo} />);

        // Wait for initial load (Page 1)
        await screen.findByText('Blé');
        expect(screen.getByText(/Page 1 sur 2/i)).toBeInTheDocument();
        expect(cultureService.getAllCultures).toHaveBeenCalledWith(1, componentInternalLimit);


        // Click "Suivant" to go to Page 2
        fireEvent.click(screen.getByText('Suivant'));
        await screen.findByText('Avoine'); // Wait for page 2 data
        expect(screen.getByText(/Page 2 sur 2/i)).toBeInTheDocument();
        expect(cultureService.getAllCultures).toHaveBeenCalledWith(2, componentInternalLimit);


        // Click "Précédent" to go back to Page 1
        fireEvent.click(screen.getByText('Précédent'));
        await screen.findByText('Blé'); // Wait for page 1 data
        expect(screen.getByText(/Page 1 sur 2/i)).toBeInTheDocument();
        expect(cultureService.getAllCultures).toHaveBeenCalledWith(1, componentInternalLimit);
    });

});
