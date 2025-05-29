// src/pages/HomePage.js
import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Shield, MapPinned, Leaf } from 'lucide-react';

export const HomePage = ({ navigateTo }) => { // Exporter directement
    // ... (code du composant HomePage comme avant)
    return (
    <Card className="text-center">
        <Shield size={64} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Bienvenue sur AgriTunisie Connect</h1>
        <p className="text-lg text-gray-600 mb-6">Votre partenaire numérique pour une agriculture prospère et durable en Tunisie.</p>
        <div className="space-x-4">
            <Button onClick={() => navigateTo('parcelles')} variant="primary" Icon={MapPinned}>Voir Mes Parcelles</Button>
            <Button onClick={() => navigateTo('cultures')} variant="secondary" Icon={Leaf}>Explorer les Cultures</Button>
        </div>
    </Card>
    );
};
// ... (Autres pages : LoginPage, RegisterPage, DashboardPage, ParcellesListPage, ParcelleFormPage, ParcelleDetailPage, etc. à mettre dans leurs propres fichiers)
// ... (S'assurer d'importer useAuth, les services, les composants communs avec les bons chemins relatifs)

export default HomePage; // Export HomePage as default