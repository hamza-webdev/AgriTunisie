import React from 'react';
import { Card } from '../components/common/Card';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => (<Card className="text-center"><AlertTriangle size={64} className="mx-auto text-yellow-500 mb-4" /><h1 className="text-3xl font-bold text-gray-800">404 - Page Non Trouvée</h1><p className="text-gray-600 mt-2">Désolé, la page que vous recherchez n'existe pas.</p></Card>);
export default NotFoundPage;