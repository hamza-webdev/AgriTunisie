// frontend/src/pages/cultures/CultureFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getCultureById, createCulture, updateCulture } from '../../services/cultureService'; // Corrected import path
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input, Textarea } from '../../components/common/FormControls'; // Assuming these exist

const CultureFormPage = ({ navigateTo, cultureId }) => {
    const [formData, setFormData] = useState({
        nom_culture: '',
        description_generale: '',
        periode_semis_ideale_debut: '', // Consider date input
        periode_semis_ideale_fin: '',   // Consider date input
        besoins_eau_mm_cycle: '',       // Consider number input
        type_sol_recommande: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const isEditing = Boolean(cultureId);

    const fetchCultureData = useCallback(async () => {
        if (isEditing) {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getCultureById(cultureId);
                if (data) {
                    // Ensure all fields are present, even if null, to prevent uncontrolled component warnings
                    setFormData({
                        nom_culture: data.nom_culture || '',
                        description_generale: data.description_generale || '',
                        periode_semis_ideale_debut: data.periode_semis_ideale_debut || '',
                        periode_semis_ideale_fin: data.periode_semis_ideale_fin || '',
                        besoins_eau_mm_cycle: data.besoins_eau_mm_cycle || '',
                        type_sol_recommande: data.type_sol_recommande || ''
                    });
                } else {
                    setError("Culture non trouvée pour l'édition.");
                }
            } catch (err) {
                console.error("Erreur lors de la récupération de la culture pour édition:", err);
                setError(err.message || 'Une erreur est survenue.');
            } finally {
                setIsLoading(false);
            }
        }
    }, [cultureId, isEditing]);

    useEffect(() => {
        fetchCultureData();
    }, [fetchCultureData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nom_culture.trim()) errors.nom_culture = "Le nom de la culture est requis.";
        // Add more specific validations as needed
        // e.g., date formats, numeric checks for besoins_eau_mm_cycle
        if (formData.besoins_eau_mm_cycle && isNaN(Number(formData.besoins_eau_mm_cycle))) {
            errors.besoins_eau_mm_cycle = "Les besoins en eau doivent être un nombre.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);
        try {
            let response;
            const payload = {
                ...formData,
                // Ensure numeric fields are numbers if API expects them
                besoins_eau_mm_cycle: formData.besoins_eau_mm_cycle ? Number(formData.besoins_eau_mm_cycle) : null,
            };

            if (isEditing) {
                // IMPORTANT: Backend API for update might not be active.
                console.warn(`Tentative de mise à jour de la culture ${cultureId} : la route backend PUT /cultures/:id n'est peut-être pas active.`);
                response = await updateCulture(cultureId, payload);
            } else {
                // IMPORTANT: Backend API for create might not be active.
                console.warn("Tentative de création de culture : la route backend POST /cultures n'est peut-être pas active.");
                response = await createCulture(payload);
            }
            navigateTo('cultureDetail', response.id || cultureId); // Navigate to detail view
        } catch (err) {
            console.error("Erreur lors de la soumission du formulaire de culture:", err);
            setError(err.message || 'Une erreur est survenue lors de la soumission.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEditing && !formData.nom_culture) { // Show loading only when fetching for edit
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !isEditing && !cultureId) { // If error during initial load for new form (less likely but good practice)
         return (
            <Card>
                <div className="text-red-600 text-center p-4">
                    <p>Erreur: {error}</p>
                    <Button onClick={() => navigateTo('culturesList')} className="mt-2">Retour à la liste</Button>
                </div>
            </Card>
        );
    }


    return (
        <Card>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                {isEditing ? 'Modifier la Culture' : 'Ajouter une Nouvelle Culture'}
            </h1>
            {error && ( // Display error messages that occur during form submission or data loading for edit
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Erreur: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Nom de la Culture"
                    name="nom_culture"
                    value={formData.nom_culture}
                    onChange={handleChange}
                    error={formErrors.nom_culture}
                    placeholder="Ex: Blé tendre d'hiver"
                    required
                />
                <Textarea
                    label="Description Générale"
                    name="description_generale"
                    value={formData.description_generale}
                    onChange={handleChange}
                    error={formErrors.description_generale}
                    rows="4"
                    placeholder="Description des caractéristiques principales, usages, etc."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Début Période de Semis Idéale"
                        name="periode_semis_ideale_debut"
                        type="text" // Consider using type="date" for better UX
                        value={formData.periode_semis_ideale_debut}
                        onChange={handleChange}
                        error={formErrors.periode_semis_ideale_debut}
                        placeholder="Ex: Mi-octobre"
                    />
                    <Input
                        label="Fin Période de Semis Idéale"
                        name="periode_semis_ideale_fin"
                        type="text" // Consider using type="date"
                        value={formData.periode_semis_ideale_fin}
                        onChange={handleChange}
                        error={formErrors.periode_semis_ideale_fin}
                        placeholder="Ex: Fin novembre"
                    />
                </div>
                <Input
                    label="Besoins en Eau (mm/cycle)"
                    name="besoins_eau_mm_cycle"
                    type="number" // Use number type for numeric input
                    value={formData.besoins_eau_mm_cycle}
                    onChange={handleChange}
                    error={formErrors.besoins_eau_mm_cycle}
                    placeholder="Ex: 450"
                />
                <Input
                    label="Type de Sol Recommandé"
                    name="type_sol_recommande"
                    value={formData.type_sol_recommande}
                    onChange={handleChange}
                    error={formErrors.type_sol_recommande}
                    placeholder="Ex: Limoneux-argileux, profond"
                />

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button type="button" onClick={() => navigateTo(isEditing ? 'cultureDetail' : 'culturesList', cultureId)} variant="outline" disabled={isLoading}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
                        {isLoading ? (isEditing ? 'Modification...' : 'Ajout...') : (isEditing ? 'Enregistrer les Modifications' : 'Ajouter la Culture')}
                    </Button>
                </div>
                {isEditing && <p className="text-xs text-gray-500 mt-1">Modifying culture ID: {cultureId}</p>}
                <p className="text-xs text-orange-500 mt-1">
                    Note: La création et la modification des cultures dépendent de l'activation des API backend correspondantes.
                </p>
            </form>
        </Card>
    );
};

export default CultureFormPage;
