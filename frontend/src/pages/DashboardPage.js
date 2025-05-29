import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MapPinned, Sun, ShoppingCart, Leaf } from 'lucide-react'; // Added Leaf

const DashboardPage = ({ navigateTo }) => {
    const { user } = useAuth();
    return (
        <Card>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Tableau de Bord</h1>
            <p className="text-gray-600">Bienvenue, {user?.nom_complet || user?.email} !</p>
            <p className="text-gray-600 mt-2">C'est ici que vous trouverez un aperçu de votre exploitation.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Button onClick={() => navigateTo('parcelles')} Icon={MapPinned} className="w-full justify-start p-6 text-left bg-green-50 hover:bg-green-100 text-green-700"><div className="ml-2"><p className="font-semibold">Mes Parcelles</p><p className="text-xs">Gérer vos terrains agricoles</p></div></Button>
                <Button onClick={() => navigateTo('meteo')} Icon={Sun} className="w-full justify-start p-6 text-left bg-blue-50 hover:bg-blue-100 text-blue-700"><div className="ml-2"><p className="font-semibold">Météo Agricole</p><p className="text-xs">Consulter les prévisions</p></div></Button>
                <Button onClick={() => navigateTo('prix')} Icon={ShoppingCart} className="w-full justify-start p-6 text-left bg-yellow-50 hover:bg-yellow-100 text-yellow-700"><div className="ml-2"><p className="font-semibold">Bourse des Prix</p><p className="text-xs">Suivre les cours du marché</p></div></Button>
                {/* New Button for Cultures Catalogue */}
                <Button onClick={() => navigateTo('culturesList')} Icon={Leaf} className="w-full justify-start p-6 text-left bg-purple-50 hover:bg-purple-100 text-purple-700"><div className="ml-2"><p className="font-semibold">Catalogue des Cultures</p><p className="text-xs">Consulter les informations sur les cultures</p></div></Button>
            </div>
        </Card>
    );
};
export default DashboardPage;