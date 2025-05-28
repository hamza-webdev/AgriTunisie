// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LogIn } from 'lucide-react';

const LoginPage = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingState, setLoadingState] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingState(true);
        try {
            await login(email, password);
            navigateTo('dashboard');
        } catch (err) {
            let displayError = err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.';
            // Vérifier si des détails d'erreur spécifiques sont disponibles
            if (err.details && Array.isArray(err.details)) {
                const specificMessages = err.details.map(detail => Object.values(detail)[0]);
                if (specificMessages.length > 0) {
                    displayError = specificMessages.join(' '); // Concaténer les messages ou prendre le premier
                }
            }
            setError(displayError);
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center mb-6"><LogIn size={48} className="mx-auto text-green-600" /><h2 className="text-2xl font-bold text-gray-800 mt-2">Connexion</h2></div>
                {error && <Alert message={error} type="error" onClose={() => setError('')} />}
                <form onSubmit={handleSubmit}>
                    <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Mot de passe" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit"