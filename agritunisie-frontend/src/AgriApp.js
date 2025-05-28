// src/AgriApp.js
import React from 'react';
import { AuthProvider } from './contexts/AuthContext'; // Assurez-vous que le chemin vers AuthContext.js est correct
import AppRouterInternal from './AppRouter'; // Assurez-vous que le chemin vers votre composant de routage principal (AppRouter.js ou AppRouterInternal.js) est correct

/**
 * AgriApp est le composant racine de l'application.
 * Il enveloppe l'application avec les fournisseurs de contexte nécessaires,
 * comme AuthProvider pour gérer l'état d'authentification global.
 */
const AgriApp = () => {
  return (
    <AuthProvider>
      <AppRouterInternal /> {/* Ou AppRouter, selon le nom de votre fichier de routage */}
    </AuthProvider>
  );
};

export default AgriApp;
