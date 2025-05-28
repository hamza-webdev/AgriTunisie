// src/pages/HomePage.js
import React from 'react';
import { Card } from '../../../agritunisie-frontend/src/components/common/Card'; // Adapter chemin
import { Button } from '../../../agritunisie-frontend/src/components/common/Button'; // Adapter chemin
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


// Pour que le code ci-dessus fonctionne comme un seul fichier exécutable (ce qui n'est pas l'objectif final mais permet de le tester dans cet environnement):
// 1. Toutes les déclarations `export const ...` deviendraient de simples `const ...` sauf pour le composant racine.
// 2. Les imports relatifs seraient supprimés car tout est dans le même fichier.
// 3. Le composant AgriApp serait le seul export par défaut.

// Composant racine pour l'exportation dans cet exemple de fichier unique
const AgriApp = () => (
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
);

export default AgriApp;