// src/pages/parcelles/ParcelleFormPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import * as parcelleService from '../../services/parcelleService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Edit3, PlusCircle } from 'lucide-react';

const ParcelleFormPage = ({ navigateTo, parcelleId }) => {
    const [nomParcelle, setNomParcelle] = useState('');
    const [description, setDescription] = useState('');
    const [superficie, setSuperficie] = useState('');
    const [typeSol, setTypeSol] = useState('');
    const [geometrie, setGeometrie] = useState('');
    const [cultureActuelleId, setCultureActuelleId] = useState('');
    const [culturesCatalogue, setCulturesCatalogue] = useState([]);
    const [loadingState, setLoadingState] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const { logout, isAuthenticated } = useAuth(); // Add isAuthenticated
    const isEditing = !!parcelleId;

    useEffect(() => {
        const fetchCultures = async () => {
            try { const data = await apiService.get('/cultures'); setCulturesCatalogue(data.data || data); }
            catch (err) { console.error("Erreur chargement catalogue cultures:", err); }
        };
        fetchCultures();
        if (isEditing && isAuthenticated) { // Check isAuthenticated for edit mode fetching
            setLoadingState(true);
            parcelleService.getParcelleById(parcelleId)
                .then(data => {
                    setNomParcelle(data.nom_parcelle); setDescription(data.description || ''); setSuperficie(data.superficie_calculee_ha || '');
                    setTypeSol(data.type_sol_predominant || ''); setGeometrie(data.geometrie ? JSON.stringify(data.geometrie) : '');
                    setCultureActuelleId(data.culture_actuelle_id || ''); setLoadingState(false);
                })
                .catch(err => {
                    setFormError(err.message || "Erreur chargement parcelle.");
                    if (err.message.includes("401")) { logout(); navigateTo('login'); } setLoadingState(false);
                });
        } else if (isEditing && !isAuthenticated) { // If trying to edit but not authenticated
            logout();
            navigateTo('login');
        }
    }, [parcelleId, isEditing, logout, navigateTo, isAuthenticated]); // Add isAuthenticated

    const handleSubmit = async (e) => {
        e.preventDefault(); setFormError(''); setFormSuccess(''); setLoadingState(true);
        let parsedGeometrie;
        try { if (geometrie) parsedGeometrie = JSON.parse(geometrie); }
        catch (err) { setFormError("Format GeoJSON invalide."); setLoadingState(false); return; }
        const parcelleData = {
            nom_parcelle: nomParcelle, description, superficie_calculee_ha: superficie ? parseFloat(superficie) : null,
            type_sol_predominant: typeSol, geometrie: parsedGeometrie,
            culture_actuelle_id: cultureActuelleId ? parseInt(cultureActuelleId) : null,
        };
        try {
            if (isEditing) { await parcelleService.updateParcelle(parcelleId, parcelleData); setFormSuccess("Parcelle mise à jour !"); }
            else { await parcelleService.createParcelle(parcelleData); setFormSuccess("Parcelle créée !"); setNomParcelle(''); setDescription(''); setSuperficie(''); setTypeSol(''); setGeometrie(''); setCultureActuelleId(''); }
            setTimeout(() => navigateTo('parcelles'), 1500);
        } catch (err) {
            setFormError(err.message || "Erreur enregistrement parcelle.");
            if (err.message.includes("401")) { logout(); navigateTo('login'); }
        } finally { setLoadingState(false); }
    };

    if (loadingState && isEditing && !nomParcelle) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;
    return (
        <Card>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">{isEditing ? "Modifier la Parcelle" : "Ajouter une Nouvelle Parcelle"}</h1>
            {formError && <Alert message={formError} type="error" onClose={() => setFormError('')} />}
            {formSuccess && <Alert message={formSuccess} type="success" onClose={() => setFormSuccess('')} />}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Nom de la parcelle" name="nomParcelle" value={nomParcelle} onChange={(e) => setNomParcelle(e.target.value)} required error={!nomParcelle && formError ? "Nom requis" : ""} />
                <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea id="description" name="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea></div>
                <Input label="Superficie (ha)" type="number" name="superficie" value={superficie} onChange={(e) => setSuperficie(e.target.value)} />
                <Input label="Type de sol prédominant" name="typeSol" value={typeSol} onChange={(e) => setTypeSol(e.target.value)} />
                <div><label htmlFor="geometrie" className="block text-sm font-medium text-gray-700 mb-1">Géométrie (GeoJSON)</label><textarea id="geometrie" name="geometrie" rows="5" value={geometrie} onChange={(e) => setGeometrie(e.target.value)} placeholder='Ex: {"type":"Polygon","coordinates":[[[10.0,36.0],[10.1,36.0],[10.1,36.1],[10.0,36.1],[10.0,36.0]]]}' className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm font-mono text-xs"></textarea><p className="mt-1 text-xs text-gray-500">Collez ici la chaîne GeoJSON. Un outil cartographique sera intégré.</p></div>
                <div><label htmlFor="cultureActuelleId" className="block text-sm font-medium text-gray-700 mb-1">Culture Actuelle (Optionnel)</label><select id="cultureActuelleId" name="cultureActuelleId" value={cultureActuelleId} onChange={(e) => setCultureActuelleId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"><option value="">-- Sélectionner --</option>{culturesCatalogue.map(c => (<option key={c.id} value={c.id}>{c.nom_culture}</option>))}</select></div>
                <div className="flex justify-end space-x-3"><Button type="button" variant="secondary" onClick={() => navigateTo('parcelles')} disabled={loadingState}>Annuler</Button><Button type="submit" variant="primary" disabled={loadingState} Icon={loadingState ? null : (isEditing ? Edit3 : PlusCircle)}>{loadingState ? <LoadingSpinner size="sm" /> : (isEditing ? "Mettre à jour" : "Créer Parcelle")}</Button></div>
            </form>
        </Card>
    );
};
export default ParcelleFormPage;
